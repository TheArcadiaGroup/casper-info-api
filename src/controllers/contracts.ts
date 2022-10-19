import { Contract } from '@models/contracts';
import { ContractJson } from '@workers/contracts';
import { Request, Response } from 'express';

export const setContract = async (contract: ContractJson) => {
  try {
    await Contract.findOneAndUpdate(
      { contractHash: contract?.contractHash, contractPackageHash: contract?.contractPackageHash },
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
    res.status(200).json(contracts).end();
  } catch (error) {
    res.status(500).send(`Could not fetch contracts: ${error}`).end();
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
    res.status(200).json(contract).end();
  } catch (error) {
    res.status(500).send(`Could not fetch contract: ${error}`).end();
  }
};
