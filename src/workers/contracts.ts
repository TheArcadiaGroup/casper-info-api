import { setContract } from '@controllers/contracts';
import {
  getDeploysCount,
  getDeploysFromDB,
  getLatestMatchedDeployIndex
} from '@controllers/deploy';
import { casperService, getLatestState } from '@utils';
import Bull from 'bull';
import { ContractPackageJson, EntryPoint } from 'casper-js-sdk/dist/lib/StoredValue';
import { addDeployHash, addMatchedDeployToSave, queryDeploy, saveDeploy } from './deploys';
import { logger } from '@logger';
import { accountUpdate } from './accounts';
export type ContractJson = {
  contractHash: string;
  contractPackageHash: string;
  contractWasmHash: string;
  namedKeys: {}[];
  entryPoints: EntryPoint[];
  contractPackage?: ContractPackageJson;
  protocolVersion: string;
  timestamp: Date;
};
export const queryContract = new Bull('contract-query', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const saveContract = new Bull('contract-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addQueryContract = async (contractHash: string, timestamp: Date) => {
  await queryContract.add(
    { contractHash, timestamp },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processQueryContract = async () => {
  queryContract.process(100, async (job, done) => {
    try {
      const { contractHash, timestamp } = job.data;
      await getChainContract(contractHash, timestamp);
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};
export const addSaveContract = async (contract: ContractJson) => {
  await saveContract.add(contract, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};
export const processSaveContract = async () => {
  saveContract.process(100, async (job, done) => {
    try {
      await setContract(job.data);
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};
const getChainContract = async (contractHash: string, timestamp: Date) => {
  try {
    const chainState = await getLatestState();
    let blockState = await casperService.getBlockState(
      chainState?.last_added_block_info?.state_root_hash,
      `hash-${contractHash}`,
      []
    );
    const chainContract = blockState.Contract;
    if (!chainContract) return;
    const contractPackageHash = chainContract.contractPackageHash.replace(
      'contract-package-wasm',
      ''
    );
    const contractWasmHash = chainContract.contractWasmHash.replace('contract-wasm-', '');
    blockState = await casperService.getBlockState(
      chainState?.last_added_block_info?.state_root_hash,
      `hash-${contractPackageHash}` as string,
      []
    );
    let contract: ContractJson = {
      contractHash,
      contractPackageHash,
      contractWasmHash,
      namedKeys: chainContract.namedKeys,
      entryPoints: chainContract.entrypoints,
      contractPackage: blockState?.ContractPackage || null,
      protocolVersion: chainContract.protocolVersion,
      timestamp
    };
    addSaveContract(contract);
  } catch (error) {
    logger.error({ contractRPC: { contractHash, errMessage: `${error}` } });
  }
};
export const seedContracts = async () => {
  // while not all deploys haven't been queried, fetch deploy
  // if nothing in deploy and contract queue, add deploy query to queue
  let i = (await getLatestMatchedDeployIndex())[0]?.index || 1;
  // TODO handle error from getDeploysCount
  while (i <= (await getDeploysCount())) {
    // If deploy queries are in queue, wait
    const deployQueryJobsCount = await queryDeploy.getJobCounts();
    const deploySaveJobsCount = await saveDeploy.getJobCounts();
    const accountUpdateJobsCount = await accountUpdate.getJobCounts();
    const queryContractJobsCount = await queryContract.getJobCounts();
    const saveContractJobsCount = await saveContract.getJobCounts();
    if (
      deployQueryJobsCount.active > 1 ||
      deployQueryJobsCount.waiting > 1 ||
      deployQueryJobsCount.failed > 1 ||
      deployQueryJobsCount.delayed > 1 ||
      deploySaveJobsCount.active > 1 ||
      deploySaveJobsCount.waiting > 1 ||
      deploySaveJobsCount.failed > 1 ||
      deploySaveJobsCount.delayed > 1 ||
      accountUpdateJobsCount.active > 1 ||
      accountUpdateJobsCount.waiting > 1 ||
      accountUpdateJobsCount.failed > 1 ||
      accountUpdateJobsCount.delayed > 1 ||
      queryContractJobsCount.active > 1 ||
      queryContractJobsCount.waiting > 1 ||
      queryContractJobsCount.failed > 1 ||
      queryContractJobsCount.delayed > 1 ||
      saveContractJobsCount.active > 1 ||
      saveContractJobsCount.waiting > 1 ||
      saveContractJobsCount.failed > 1 ||
      saveContractJobsCount.delayed > 1
    ) {
      continue;
    }
    // TODO handle error from get deploys
    const deploys = await getDeploysFromDB(i, 1, 'asc');
    await addDeployHash(deploys[0].deployHash);
    await addMatchedDeployToSave(i);
    i++;
  }
};
