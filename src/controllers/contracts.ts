import { Contract } from '@models/contracts';
import { getLatestState, rpcRequest } from '@utils';
import { ContractJson } from '@workers/contracts';
import { Request, Response } from 'express';
import { getContractMonthlyDeployCount } from './deploy';

export const setContract = async (contract: ContractJson) => {
  try {
    await Contract.findOneAndUpdate(
      {
        contractHash: contract?.contractHash,
        contractPackageHash: contract?.contractPackageHash
      },
      {
        ...contract
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    // TODO handle error
    console.log(`Err: ${error}`);
    throw new Error(`Could not save contract in DB: ${error}`);
  }
};
export const getContracts = async (req: Request, res: Response) => {
  try {
    const contracts = await Contract.find();
    const monthlyDeployCounts = await getContractMonthlyDeployCount();
    for (let i = 0; i < contracts.length; i++) {
      contracts[i].deploys =
        monthlyDeployCounts?.find((deployCount) => deployCount?._id === contracts[i].contractHash)
          ?.count || 0;
    }

    res.status(200).json(contracts.filter((contract) => contract.contractHash));
  } catch (error) {
    res.status(500).send(`Could not fetch contracts: ${error}`);
  }
};

export const getContractFromDB = async (hash: string) => {
  try {
    return await Contract.findOne({ $or: [{ contractHash: hash }, { contractPackageHash: hash }] });
  } catch (error) {
    throw new Error(`Could not fetch contract from DB: ${error}`);
  }
};
export const getContract = async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    const contract = await getContractFromDB(hash);
    const chainState = await getLatestState();
    const rawData = await rpcRequest('state_get_item', [
      chainState?.last_added_block_info?.state_root_hash,
      `hash-${hash}`,
      []
    ]);
    contract.rawData = rawData?.stored_value;
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).send(`Could not fetch contract: ${error}`);
  }
};

export const getUref = async (req: Request, res: Response) => {
  try {
    const { uref } = req.params;
    const chainState = await getLatestState();
    const rawData = await rpcRequest('state_get_item', [
      chainState?.last_added_block_info?.state_root_hash,
      uref,
      []
    ]);
    res.status(200).json(rawData?.stored_value);
  } catch (error) {
    res.status(500).send(`Could not fetch contract uref: ${error}`);
  }
};
