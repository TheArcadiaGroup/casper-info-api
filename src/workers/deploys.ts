import { setDeploy } from '@controllers/deploy';
import { logger } from '@logger';
import Bull from 'bull';
import { addAccountUpdate } from './accounts';
import { casperService } from '@utils';
import { GetDeployResult } from 'casper-js-sdk';
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
export const addDeployToSave = async (deploy: GetDeployResult, type: string) => {
  await saveDeploy.add(
    { deploy, type },
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
      await setDeploy(job.data.deploy, job.data.hash);
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
    addAccountUpdate(
      deployResult.deploy?.header?.account,
      new Date(deployResult.deploy.header.timestamp)
    );
    const validatorPublicKey = deployRes.deploy?.session?.StoredContractByHash?.args?.find(
      (value) => {
        return value[0] === 'validator';
      }
    )[1]?.parsed;
    if (validatorPublicKey) {
      addAccountUpdate(validatorPublicKey, new Date(deployResult.deploy.header.timestamp));
    }
  } catch (error) {
    logger.error({ deployRPC: { deployHash: hash, errMessage: `${error}` } });
  }
};
