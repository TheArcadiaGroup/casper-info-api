import { Contract } from '@models/contracts';
import { ContractJson } from '@workers/contracts';
// import { Contract } from '@workers/contracts';

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
export const getContracts = async () => {
  try {
  } catch (error) {}
};
