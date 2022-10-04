import { getDeploysByEntryPointAndPublicKey } from '@controllers/deploy';
import { CLPublicKey, GetStatusResult } from 'casper-js-sdk';
import { ethers } from 'ethers';
import { casperClient, getBlockEra, getLatestState } from '@utils';
import { processPublicKeyAndAccountHash } from '@controllers/account';

export const getAccountBalanceByAddress = async (address: string): Promise<number> => {
  try {
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    console.log('Balance PK: ', publicKey);
    const balance = publicKey
      ? await casperClient.balanceOfByPublicKey(CLPublicKey.fromHex(publicKey))
      : null;
    return balance && Number(ethers.utils.formatUnits(balance, 9));
  } catch (error) {
    throw new Error(`Could not fetch account balance: ${error}`);
  }
};

export const getUnstakingAmount = async (publicKey): Promise<number> => {
  const accountDeploys = await getDeploysByEntryPointAndPublicKey(publicKey, 'undelegate');
  let unstaking = 0;
  for (let i = 0; i < accountDeploys.length; i++) {
    if (accountDeploys[i].status !== 'success') return;
    const deployEra = await getBlockEra(accountDeploys[i].blockHash);
    const latestState = <GetStatusResult>await getLatestState();
    const currentEra = latestState.last_added_block_info.era_id;
    if (<number>deployEra + 8 <= <number>currentEra) return;
    unstaking += accountDeploys[i].amount;
  }
  return unstaking;
};

// TODO determine address type (Validator Public Key || Account Public Key || Account Hash)
