import { setDeploy } from '@controllers/deploy';
import { logger } from '@logger';
import Bull from 'bull';
import axios from 'axios';
import { addAccountUpdate } from './accounts';
import { casperService } from '@utils';
import { GetDeployResult } from 'casper-js-sdk';
import { addQueryContract } from './contracts';

let page = 6959;
let pageSize = 50000;
let count = 0;

export const queryDeploy = new Bull('deploy-query', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const saveDeploy = new Bull('deploy-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addDeployHashes = async (hash: string, hashType: 'deploy' | 'transfer') => {
  await queryDeploy.add(
    { hash, hashType },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processDeployQuery = async () => {
  queryDeploy.process(100, async (job, done) => {
    QueryDeploy(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
// Add deploy to deploy saving queue
export const addDeployToSave = async (deploy: GetDeployResult, hashType: string) => {
  await saveDeploy.add(
    { deploy, hashType },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processDeploySave = async () => {
  saveDeploy.process(100, async (job, done) => {
    try {
      const { deploy, hashType } = job.data;
      await setDeploy(deploy, hashType);
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};

export const QueryDeploy = async (data) => {
  const { hash, hashType } = data;
  try {
    const deployResult = await casperService.getDeployInfo(hash);
    const deployRes: any = deployResult;
    await addDeployToSave(deployRes, hashType);
    await addAccountUpdate(
      deployResult.deploy?.header?.account,
      new Date(deployResult.deploy.header.timestamp)
    );
    const validatorPublicKey = deployRes.deploy?.session?.StoredContractByHash?.args?.find(
      (value) => {
        return value[0] === 'validator';
      }
    )[1]?.parsed;
    if (validatorPublicKey) {
      await addAccountUpdate(validatorPublicKey, new Date(deployResult.deploy.header.timestamp));
    }
    const contractHash: string =
      deployRes.deploy?.session?.StoredContractByHash?.hash ||
      deployRes.deploy?.session?.StoredContractByName?.hash ||
      '';
    await addQueryContract(contractHash, new Date(deployResult.deploy.header.timestamp));
  } catch (error) {
    logger.error({ deployRPC: { deployHash: hash, errMessage: `${error}` } });
  }
};

export const matchDeploys = () => {
  setInterval(async () => {
    try {
      const res = await axios.get(
        `https://event-store-api-clarity-mainnet.make.services/extended-deploys?page=${page}&limit=100`
        // `https://api.casperstats.io/chain/get-latest-txs?start=${page}&count=${pageSize}`
      );
      // console.log(res.data);
      page--;
      count += res.data?.length;
      console.log(count);
    } catch (error) {
      console.log(error);
    }
  }, 1000);
};
