import { Deploy } from '@models/deploys';
import { logger } from 'logger';
import { ethers } from 'ethers';
import { CLPublicKey } from 'casper-js-sdk';
import { group } from 'console';
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
  entryPoint = entryPoint.replace('_', ' ');
  await Deploy.findOneAndUpdate(
    { deployHash: deployResult.deploy?.hash },
    {
      deployHash: deployResult.deploy?.hash,
      publicKey: deployResult.deploy?.header?.account,
      blockHash: deployResult?.execution_results[0].block_hash,
      timestamp: deployResult.deploy.header.timestamp,
      entryPoint,
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
        hashType === 'transfer' ? deployResult.deploy.session?.Transfer?.args[1][1]?.parsed : '',
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

export const getDeploys = async (req: any, res: any) => {
  const startIndex: number = req.query.startIndex;
  const count: number = req.query.count;
  await Deploy.find()
    .sort({ timestamp: 'desc' })
    .skip(startIndex - 1)
    .limit(count)
    .then((deploys) => {
      res.status(200).json(deploys);
    })
    .catch((err) => {
      res.status(500);
    });
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

export const getDeploysByEntryPointAndPublicKey = async (
  publicKey: string,
  entryPoint: string,
  startIndex?: number,
  count?: number
) => {
  if (count > 0) {
    return await Deploy.find({ $and: [{ publicKey }, { entryPoint }] })
      .sort({ timestamp: 'desc' })
      .skip(startIndex - 1)
      .limit(count)
      .catch((err) => {
        // TODO handle error
        throw new Error(err);
      });
  } else {
    return await Deploy.find({ $and: [{ publicKey }, { entryPoint }] }).catch((err) => {
      // TODO handle error
      throw new Error(err);
    });
  }
};
export const getDeploysByTypeAndPublicKey = async (
  publicKey: string,
  deployType: string,
  startIndex?: number,
  count?: number
) => {
  if (count > 0) {
    return await Deploy.find({ $and: [{ publicKey }, { deployType }] })
      .sort({ timestamp: 'desc' })
      .skip(startIndex - 1)
      .limit(count)
      .catch((err) => {
        // TODO handle error
        throw new Error(err);
      });
  } else {
    return await Deploy.find({ $and: [{ publicKey }, { deployType }] }).catch((err) => {
      // TODO handle error
      throw new Error(err);
    });
  }
};

export const getTransferByBlockHash = async (blockHash: string) => {
  return await Deploy.find({ blockHash }).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};
export const getDeployVolumes = async (req, res) => {
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
