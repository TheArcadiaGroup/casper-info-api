import { setContract } from '@controllers/contracts';
import { casperService, getLatestState } from '@utils';
import Bull from 'bull';
import { ContractPackageJson, EntryPoint } from 'casper-js-sdk/dist/lib/StoredValue';
export type ContractJson = {
  contractHash: string;
  contractPackageHash: string;
  contractWasmHash: string;
  namedKeys: {}[];
  entryPoints: EntryPoint[];
  contractPackage?: ContractPackageJson;
  protocolVersion: string;
  name?: string;
  contractType?: string;
  owner?: string;
  deploys?: number;
  timestamp: Date;
};
export const queryContract = new Bull('contract-query', {
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

const getChainContract = async (contractHash: string, timestamp: Date) => {
  try {
    const chainState = await getLatestState();
    let blockState = await casperService.getBlockState(
      chainState?.last_added_block_info.state_root_hash,
      `hash-${contractHash}`,
      null
    );
    const chainContract = blockState.Contract;
    // console.log(blockState.Contract);
    if (!chainContract) return;
    const contractPackageHash = chainContract.contractPackageHash.replace(
      'contract-package-wasm',
      ''
    );
    const contractWasmHash = chainContract.contractWasmHash.replace('contract-wasm-', '');
    blockState = await casperService.getBlockState(
      chainState?.last_added_block_info.state_root_hash,
      `hash-${contractPackageHash}` as string,
      null
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
    // console.log(JSON.stringify(contract, null, 2));
    addSaveContract(contract);
  } catch (error) {
    throw new Error(`Could not fetch contract from the chain: ${error}`);
  }
};
