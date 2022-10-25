import { Request, Response } from 'express';
import { Deploy, MatchedDeploy } from '@models/deploys';
import { logger } from '@logger';
import { ethers } from 'ethers';
import { CLPublicKey } from 'casper-js-sdk';
import { casperService } from '@utils';
import { getAccountBalanceByAddress } from '@utils/accounts';
import { getContractFromDB } from './contracts';
// import { Deploy } from 'casper-js-sdk/dist/lib/DeployUtil';
let amountInNextParsed = false;
let amount: number;
export const setDeploy = async (deployResult) => {
  try {
    let hashType: 'deploy' | 'transfer';
    const entryPoint: string =
      deployResult?.deploy?.session?.StoredContractByHash ||
      deployResult?.deploy?.session?.StoredContractByName
        ? deployResult?.deploy?.session.StoredContractByHash?.entry_point ||
          deployResult?.deploy?.session.StoredContractByName?.entry_point
        : deployResult.deploy?.session?.Transfer
        ? 'transfer'
        : deployResult.deploy?.session?.ModuleBytes
        ? 'WASM Deploy'
        : 'N/A';
    const validator =
      deployResult.deploy.session.StoredContractByHash?.entry_point == 'delegate' ||
      deployResult.deploy.session.StoredContractByHash?.entry_point == 'undelegate'
        ? deployResult.deploy.session.StoredContractByHash?.args?.find((value) => {
            return value[0] == 'validator';
          })[1]?.parsed
        : '';
    hashType = deployResult.deploy?.session?.Transfer ? 'transfer' : 'deploy';
    const fromAccountHash =
      hashType === 'transfer'
        ? CLPublicKey.fromHex(deployResult.deploy?.header?.account)
            .toAccountHashStr()
            .replace('account-hash-', '')
        : '';
    const toAccountHash =
      hashType === 'transfer'
        ? getToAccountHash(deployResult.deploy.session?.Transfer?.args[1][1]?.parsed)
        : '';
    await Deploy.findOneAndUpdate(
      { deployHash: deployResult.deploy?.hash },
      {
        deployHash: deployResult.deploy?.hash,
        publicKey: deployResult.deploy?.header?.account,
        blockHash: deployResult?.execution_results[0].block_hash,
        timestamp: deployResult.deploy.header.timestamp,
        entryPoint: entryPoint.replace(/_/g, ' '),
        amount: getAmount(deployResult.deploy.session),
        cost: Number(
          ethers.utils.formatUnits(
            deployResult?.execution_results[0]?.result?.Success?.cost ||
              deployResult?.execution_results[0]?.result?.Failure?.cost,
            9
          )
        ),
        validator,
        fromAccountHash,
        fromAccountBalance: fromAccountHash ? await getAccountBalanceByAddress(fromAccountHash) : 0,
        toAccountHash,
        toAccountBalance: toAccountHash ? await getAccountBalanceByAddress(toAccountHash) : 0,
        status: deployResult?.execution_results[0]?.result?.Success ? 'success' : 'fail',
        deployType: hashType,
        contractHash:
          deployResult.deploy?.session?.StoredContractByHash?.hash ||
          deployResult.deploy?.session?.StoredContractByName?.hash ||
          ''
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    logger.error({
      deployDB: {
        deployHash: deployResult.deploy.hash,
        errMessage: `${error}`,
        rawData: deployResult
      }
    });
  }
  amount = 0;
};
export const setMatchedDeployIndex = async (index: number) => {
  try {
    await MatchedDeploy.findOneAndUpdate({ index }, { index }, { upsert: true });
  } catch (error) {
    throw new Error(`Could not save match deploy index: ${error}`);
  }
};
export const getLatestMatchedDeployIndex = async () => {
  try {
    return await MatchedDeploy.find().sort({ index: 'desc' }).limit(1);
  } catch (error) {
    throw new Error(`Could not get latest matched deploy index: ${error}`);
  }
};
export const getDeploys = async (req: Request, res: Response) => {
  try {
    const { startIndex, count } = req.query;
    const deploys = await getDeploysFromDB(Number(startIndex), Number(count), 'desc');
    res.status(200).json(deploys);
  } catch (error) {
    res.status(500).send(`Could not fetch deploys: ${error}`);
  }
};
export const getDeploysFromDB = async (startIndex: number, count: number, sort: 'asc' | 'desc') => {
  try {
    return await Deploy.find()
      .sort({ timestamp: sort })
      .skip(startIndex - 1)
      .limit(count);
  } catch (error) {
    throw new Error(`Could not fetch deploys from DB: ${error}`);
  }
};
export const getDeployByHash = async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    const deploy = await casperService.getDeployInfo(hash);
    res.status(200).json(deploy);
  } catch (error) {
    res.status(500).send(`Could not fetch deploy details: ${error}`);
  }
};

const getAmount = (session): number => {
  for (let k in session) {
    if (session[k] instanceof Object) {
      getAmount(session[k]);
    } else {
      if (session[k] == 'amount') {
        amountInNextParsed = true;
      }
      if (k == 'parsed' && amountInNextParsed) {
        amount = Number(ethers.utils.formatUnits(session[k], 9));
        amountInNextParsed = false;
      }
    }
  }
  // console.log(amount);
  return amount ?? 0;
};
const getToAccountHash = (hash): string => {
  try {
    return CLPublicKey.fromHex(hash).toAccountHashStr().replace('account-hash-', '');
  } catch (error) {
    return hash;
  }
};
export const getDeploysByEntryPointAndPublicKey = async (
  publicKey: string,
  entryPoint: string,
  startIndex?: number,
  count?: number
) => {
  return await Deploy.find({ $and: [{ publicKey }, { entryPoint }] })
    .sort({ timestamp: 'desc' })
    .skip(startIndex - 1)
    .limit(count)
    .catch((err) => {
      // TODO handle error
      throw new Error(err);
    });
};
export const getDeploysByTypeAndPublicKeyOrAccountHash = async (
  address: string,
  deployType: 'transfer' | 'deploy',
  startIndex?: number,
  count?: number
) => {
  if (count > 0) {
    return await Deploy.find({ $or: [{ publicKey: address }, { toAccountHash: address }] })
      .sort({ timestamp: 'desc' })
      .skip(startIndex - 1)
      .limit(count)
      .catch((err) => {
        // TODO handle error
        throw new Error(err);
      });
  } else {
    return await Deploy.find({ $or: [{ publicKey: address }, { toAccountHash: address }] }).catch(
      (err) => {
        // TODO handle error
        throw new Error(err);
      }
    );
  }
};

export const getDeploysByBlockHash = async (blockHash: string) => {
  return await Deploy.find({ blockHash }).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};
export const getDeploysByContractHash = async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    const contract = await getContractFromDB(hash);
    const { startIndex, count } = req.query;
    const contractDeploys = await Deploy.find({ contractHash: contract.contractHash })
      .sort({ timestamp: 'desc' })
      .skip(Number(startIndex) - 1)
      .limit(Number(count));
    res.status(200).json(contractDeploys).end();
  } catch (error) {
    res.status(500).send(`Could not fetch deploys by contract hash: ${error}`).end();
  }
};
export const getContractMonthlyDeployCount = async () => {
  try {
    const thirtyDaysAgo = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30).toISOString();
    // return await Deploy.find({
    //   timestamp: { $gte: new Date(thirtyDaysAgo) }
    // });
    return await Deploy.aggregate([
      { $match: { timestamp: { $gte: new Date(thirtyDaysAgo) } } },
      { $group: { _id: '$contractHash', count: { $sum: 1 } } }
    ]);
  } catch (error) {
    throw new Error(`Could not fetch contract deploy count: ${error}`);
  }
};
export const getDeployVolumes = async (req: Request, res: Response) => {
  try {
    const { days } = req.params;
    const volumes = await Deploy.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          volume: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $skip: 1 },
      { $limit: Number(days) + 1 }
    ]);
    const totalDeploys = await Deploy.find().count();
    const deploys = {
      volumes,
      totalDeploys
    };
    res.status(200).json(deploys);
  } catch (error) {
    res.status(500).send(`Could not fetch deploy volumes: ${error}`);
  }
};

export const getTransfersCount = async (): Promise<{ _id: string; count: number }[]> => {
  return await Deploy.aggregate([
    { $match: { entryPoint: 'transfer' } },
    { $group: { _id: '$entryPoint', count: { $sum: 1 } } }
  ]).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};

export const getDeploysCount = async (): Promise<number> => {
  try {
    return await Deploy.find().count();
  } catch (error) {
    throw new Error(`Could not fetch all deploys: ${error}`);
  }
};

export const getDeployByPublicKey = async (deployHash: string) => {
  try {
    return await Deploy.findOne({ deployHash });
  } catch (error) {
    throw new Error(`Could not fetch deploy by public key: ${error}`);
  }
};
