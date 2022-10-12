import { Request, Response } from 'express';
import { Deploy } from '@models/deploys';
import { logger } from '@logger';
import { ethers } from 'ethers';
import { CLPublicKey } from 'casper-js-sdk';
import { casperService } from '@utils';
let amountInNextParsed = false;
let amount: number;
export const setDeploy = async (deployResult, hashType: 'deploy' | 'transfer') => {
  let entryPoint: string =
    deployResult?.deploy?.session?.StoredContractByHash ||
    deployResult?.deploy?.session?.StoredContractByName
      ? deployResult?.deploy?.session.StoredContractByHash?.entry_point ||
        deployResult?.deploy?.session.StoredContractByName?.entry_point
      : deployResult.deploy?.session?.Transfer
      ? 'transfer'
      : deployResult.deploy?.session?.ModuleBytes
      ? 'WASM Deploy'
      : 'N/A';
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
      validator:
        deployResult.deploy.session.StoredContractByHash?.entry_point == 'delegate' ||
        deployResult.deploy.session.StoredContractByHash?.entry_point == 'undelegate'
          ? deployResult.deploy.session.StoredContractByHash?.args?.find((value) => {
              return value[0] == 'validator';
            })[1]?.parsed
          : '',
      fromAccountHash:
        hashType === 'transfer'
          ? CLPublicKey.fromHex(deployResult.deploy?.header?.account)
              .toAccountHashStr()
              .replace('account-hash-', '')
          : '',
      toAccountHash:
        hashType === 'transfer'
          ? getToAccountHash(deployResult.deploy.session?.Transfer?.args[1][1]?.parsed)
          : '',
      status: deployResult?.execution_results[0]?.result?.Success ? 'success' : 'fail',
      deployType: hashType
    },
    { new: true, upsert: true }
  )
    .then((deploy) => {
      console.log(deploy.deployHash);
    })
    .catch((err) => {
      logger.error({
        deployDB: {
          deployHash: deployResult.deploy.hash,
          errMessage: `${err}`,
          rawData: deployResult
        }
      });
    });
  amount = 0;
};

export const getDeploys = async (req: Request, res: Response) => {
  const { startIndex, count } = req.query;
  await Deploy.find()
    .sort({ timestamp: 'desc' })
    .skip(Number(startIndex) - 1)
    .limit(Number(count))
    .then((deploys) => {
      res.status(200).json(deploys);
    })
    .catch((err) => {
      res.status(500);
    });
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
export const getDeploysByEntryPointAndPublicKey = async (publicKey: string, entryPoint: string) => {
  return await Deploy.find({ $and: [{ publicKey }, { entryPoint }] }).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};
export const getDeploysByTypeAndPublicKeyOrAccountHash = async (
  address: string,
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

export const getTransferByBlockHash = async (blockHash: string) => {
  return await Deploy.find({ blockHash }).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};
export const getDeployVolumes = async (req: Request, res: Response) => {
  await Deploy.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: { $dateToString: { format: '%m/%d/%Y', date: '$timestamp' } },
        volume: { $sum: 1 }
      }
    },
    { $limit: 14 }
  ])
    .then((volumes) => {
      res.status(200).json(volumes);
    })
    .catch((err) => {
      res.status(500).send(`Could not fetch deploy volumes: ${err}`);
    });
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

export const getDeployByPublicKey = async (deployHash: string) => {
  try {
    return await Deploy.findOne({ deployHash });
  } catch (error) {
    console.log(error);
  }
};
