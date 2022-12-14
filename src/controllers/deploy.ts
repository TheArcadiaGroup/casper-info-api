import { Request, Response } from 'express';
import { Deploy, MatchedDeploy } from '@models/deploys';
import { logger } from '@logger';
import { ethers } from 'ethers';
import { CLPublicKey } from 'casper-js-sdk';
import { casperService } from '@utils';
import { getAccountBalanceByAddress } from '@utils/accounts';
import { getContractFromDB } from './contracts';
import { DeployJson } from 'casper-js-sdk/dist/lib/DeployUtil';
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
      entryPoint === 'transfer' || 'delegate'
        ? CLPublicKey.fromHex(deployResult.deploy?.header?.account)
            .toAccountHashStr()
            .replace('account-hash-', '')
        : '';
    const toAccountHash = getToAccountHash(deployResult.deploy.session) || '';
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
  await MatchedDeploy.findOneAndUpdate({ index }, { index }, { upsert: true });
};
export const getLatestMatchedDeployIndex = async () => {
  return await MatchedDeploy.find().sort({ index: 'desc' }).limit(1);
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
  return await Deploy.find()
    .sort({ timestamp: sort })
    .skip(startIndex - 1)
    .limit(count);
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
const getToAccountHash = (session: any): string => {
  let hash: string = session?.Transfer
    ? session?.Transfer?.args[1]?.[1]?.parsed
    : session.StoredContractByHash?.entry_point == 'delegate'
    ? session.StoredContractByHash?.args?.find((value) => {
        return value[0] == 'validator';
      })[1]?.parsed
    : '';

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
    .limit(count);
};

export const getTransfersByAccountPublicKey = async (
  address: string,
  startIndex?: number,
  count?: number
) => {
  return await Deploy.find({
    $and: [
      { $or: [{ publicKey: address }, { toAccountHash: address }] },
      { $or: [{ entryPoint: 'transfer' }, { entryPoint: 'delegate' }] }
    ]
  })
    .sort({ timestamp: 'desc' })
    .skip(startIndex - 1)
    .limit(count);
};
export const getDeploysByAccountPublicKey = async (
  address: string,
  startIndex?: number,
  count?: number
) => {
  if (count > 0) {
    return await Deploy.find({
      $and: [{ publicKey: address }, { $not: { toAccountHash: address } }]
    })
      .sort({ timestamp: 'desc' })
      .skip(startIndex - 1)
      .limit(count);
  } else {
    return await Deploy.find({
      $and: [{ publicKey: address }, { $not: { toAccountHash: address } }]
    });
  }
};
export const getDeploysByBlockHash = async (blockHash: string) => {
  return await Deploy.find({ blockHash });
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
  const thirtyDaysAgo = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30).toISOString();
  return await Deploy.aggregate([
    { $match: { timestamp: { $gte: new Date(thirtyDaysAgo) } } },
    { $group: { _id: '$contractHash', count: { $sum: 1 } } }
  ]);
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
  ]);
};

export const getDeploysCount = async (): Promise<number> => {
  return await Deploy.find().count();
};

export const getDeployByPublicKey = async (deployHash: string) => {
  return await Deploy.findOne({ deployHash });
};
