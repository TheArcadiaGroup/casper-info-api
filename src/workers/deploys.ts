import { getDeploysByBlockHash, setDeploy } from '@controllers/deploy';
import { logger } from '@logger';
import Bull from 'bull';
import axios from 'axios';
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
  saveDeploy.process(500, async (job, done) => {
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
    contractHash &&
      (await addQueryContract(contractHash, new Date(deployResult.deploy.header.timestamp)));
  } catch (error) {
    logger.error({ deployRPC: { deployHash: hash, errMessage: `${error}` } });
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
    // console.log(i);
    // Fetch number of deploys and transfers for the block
    const block = await getBlockByHeightFromDB(i);
    // Fetch number of saved deploys and transfers for the block
    const blockDeploys = block && (await getDeploysByBlockHash(block.blockHash));
    // Compare number of block deploys/transfers - if number doesn't match, fetch chain deploys for the block and save them
    if (block?.transfers + block?.deploys !== blockDeploys?.length) {
      addBlockToQueryQueue(block?.blockHeight);
      console.log(`Block deploys matched: ${block?.blockHeight}`);
    }
    console.log(
      `Block deploys confirmed: ${i}: ${block?.transfers + block?.deploys}:${blockDeploys?.length}`
    );
  }
};
