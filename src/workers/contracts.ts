import { getContract, setContract } from '@controllers/contracts';
import { TypedJSON, jsonMember, jsonObject } from 'typedjson';
import {
  getDeploys,
  getDeploysCount,
  getDeploysFromDB,
  getLatestMatchedDeployIndex,
  setMatchedDeployIndex
} from '@controllers/deploy';
import { casperService, getLatestState, rpcRequest } from '@utils';
import Bull from 'bull';
import { ContractPackageJson, EntryPoint } from 'casper-js-sdk/dist/lib/StoredValue';
import { addDeployHash, queryDeploy } from './deploys';
export type ContractJson = {
  contractHash: string;
  contractPackageHash: string;
  contractWasmHash: string;
  namedKeys: {}[];
  entryPoints: EntryPoint[];
  contractPackage?: ContractPackageJson;
  protocolVersion: string;
};
export const queryContract = new Bull('contract-query', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

export const addQueryContract = async (contractHash: string) => {
  await queryContract.add(
    { contractHash },
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
      const { contractHash } = job.data;
      await getChainContract(contractHash);
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};

export const saveContract = new Bull('contract-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

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

const getChainContract = async (contractHash: string) => {
  try {
    const chainState = await getLatestState();
    let blockState = await casperService.getBlockState(
      chainState?.last_added_block_info.state_root_hash,
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
      chainState?.last_added_block_info.state_root_hash,
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
      protocolVersion: chainContract.protocolVersion
    };
    addSaveContract(contract);
  } catch (error) {
    throw new Error(`Could not fetch contract from the chain: ${error}`);
  }
};

export const seedContracts = async () => {
  // while not all deploys haven't been queried, fetch deploy
  // if nothing in deploy and contract queue, add deploy query to queue
  let i = (await getLatestMatchedDeployIndex())[0]?.index || 1;

  while (i <= (await getDeploysCount())) {
    // If deploy queries are in queue, wait
    const deployJobsCount = await queryDeploy.getJobCounts();
    if (
      deployJobsCount.active > 1 ||
      deployJobsCount.waiting > 1 ||
      deployJobsCount.failed > 1 ||
      deployJobsCount.delayed > 1
    ) {
      continue;
    }
    const deploys = await getDeploysFromDB(i, 1000, 'asc');
    deploys?.forEach(async (deploy) => {
      await addDeployHash(deploy.deployHash);
      await setMatchedDeployIndex(i);
      i++;
    });
  }
};
