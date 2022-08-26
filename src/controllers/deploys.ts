import { Deploy, RawDeploy } from '@models/deploys';
import { logger } from 'logger';
import { ethers } from 'ethers';
let amountInNextParsed = false;
let amount: number;
export const setDeploy = async (deployResult) => {
  let entryPoint: string =
    deployResult?.deploy?.session?.StoredContractByHash ||
    deployResult?.deploy?.session?.StoredContractByName
      ? deployResult?.deploy?.session.StoredContractByHash?.entry_point ||
        deployResult?.deploy?.session.StoredContractByName?.entry_point
      : deployResult.deploy?.session?.Transfer
      ? 'Transfer'
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
      entryPoint: entryPoint.charAt(0).toUpperCase() + entryPoint.slice(1),
      amount: getAmount(deployResult.deploy.session),
      cost: Number(
        ethers.utils.formatUnits(
          deployResult?.execution_results[0]?.result?.Success?.cost ||
            deployResult?.execution_results[0]?.result?.Failure?.cost,
          9
        )
      )
    },
    { new: true, upsert: true }
  )
    .then((deploy) => console.log(deploy.deployHash))
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
  await RawDeploy.create({
    deploy: deployResult
  }).catch((err) => {
    logger.error({
      rawDeployDB: {
        deployHash: deployResult.deploy.hash,
        errMessage: `${err}`,
        rawData: deployResult
      }
    });
  });
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

export const getAmount = (session): number => {
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
