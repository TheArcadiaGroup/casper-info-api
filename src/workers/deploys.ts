import { getDeploysByBlockHash, setDeploy, setMatchedDeployIndex } from '@controllers/deploy';
import { logger } from '@logger';
import Bull from 'bull';
import { addAccountUpdate } from './accounts';
import { casperService, getLatestState } from '@utils';
import { GetDeployResult } from 'casper-js-sdk';
import { addQueryContract } from './contracts';
import { getBlockByHeightFromDB } from '@controllers/block';
import { addBlockToQueryQueue } from './blocks';

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
export const saveMatchedDeploy = new Bull('match-deploy-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addDeployHash = async (deployHash: string) => {
  await queryDeploy.add(
    { deployHash },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processDeployQuery = async () => {
  queryDeploy.process(100, async (job, done) => {
    QueryDeploy(job.data.deployHash)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
// Add deploy to deploy saving queue
export const addDeployToSave = async (deploy: GetDeployResult) => {
  await saveDeploy.add(deploy, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};
export const processDeploySave = async () => {
  saveDeploy.process(100, async (job, done) => {
    try {
      await setDeploy(job.data);
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};

export const addMatchedDeployToSave = async (index: number) => {
  await saveMatchedDeploy.add(index, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};
export const processMatchedDeployToSave = async () => {
  saveMatchedDeploy.process(100, async (job, done) => {
    try {
      await setMatchedDeployIndex(job.data);
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};

export const QueryDeploy = async (deployHash: string) => {
  try {
    const deployRes: any = await casperService.getDeployInfo(deployHash);
    await addDeployToSave(deployRes);
    await addAccountUpdate(
      deployRes.deploy?.header?.account,
      new Date(deployRes.deploy.header.timestamp)
    );
    const validatorPublicKey =
      deployRes.deploy.session.StoredContractByHash?.entry_point == 'delegate' ||
      deployRes.deploy.session.StoredContractByHash?.entry_point == 'undelegate'
        ? deployRes.deploy.session.StoredContractByHash?.args?.find((value) => {
            return value[0] == 'validator';
          })[1]?.parsed
        : '';
    if (validatorPublicKey) {
      await addAccountUpdate(validatorPublicKey, new Date(deployRes.deploy.header.timestamp));
    }
    const contractHash: string =
      deployRes.deploy?.session?.StoredContractByHash?.hash ||
      deployRes.deploy?.session?.StoredContractByName?.hash ||
      '';

    contractHash &&
      (await addQueryContract(contractHash, new Date(deployRes.deploy.header.timestamp)));
  } catch (error) {
    logger.error({ deployRPC: { deployHash, errMessage: `${error}` } });
  }
};

export const matchDeploys = async () => {
  // Loop through blocks
  const chainState = await getLatestState();
  for (let i = 0; i < chainState.last_added_block_info.height; i++) {
    // check if deploys are in querying queue
    const deployQueries = await queryDeploy.getJobCounts();
    if (
      deployQueries.active > 1 ||
      deployQueries.delayed > 1 ||
      deployQueries.waiting > 1 ||
      deployQueries.failed > 1
    ) {
      console.log('Queue busy');
    }
    // Fetch number of deploys and transfers for the block
    const block = await getBlockByHeightFromDB(i);
    // Fetch number of saved deploys and transfers for the block
    // TODO handle error from getDeploysByBlockHash
    const blockDeploys = block && (await getDeploysByBlockHash(block.blockHash));
    // Compare number of block deploys/transfers - if number doesn't match, fetch chain deploys for the block and save them
    if (block?.transfers + block?.deploys !== blockDeploys?.length) {
      addBlockToQueryQueue(block?.blockHeight);
      console.log(`Block deploys matched: ${block?.blockHeight}`);
    }
  }
};
