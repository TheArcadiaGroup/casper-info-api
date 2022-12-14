import { getDeploysByEntryPointAndPublicKey } from '@controllers/deploy';
import { CLPublicKey, GetStatusResult } from 'casper-js-sdk';
import { ethers } from 'ethers';
import { casperClient, getBlockEra, getLatestState } from '@utils';
import { processPublicKeyAndAccountHash } from '@controllers/account';

export const getAccountBalanceByAddress = async (address: string): Promise<number> => {
  const { publicKey } = await processPublicKeyAndAccountHash(address);
  const balance = publicKey
    ? await casperClient.balanceOfByPublicKey(CLPublicKey.fromHex(publicKey))
    : null;
  return balance && Number(ethers.utils.formatUnits(balance, 9));
};

export const getUnstakingAmount = async (publicKey): Promise<number> => {
  const accountDeploys = await getDeploysByEntryPointAndPublicKey(publicKey, 'undelegate');
  let unstaking = 0;
  for (let i = 0; i < accountDeploys.length; i++) {
    if (accountDeploys[i].status !== 'success') return;
    const deployEra = await getBlockEra(accountDeploys[i].blockHash);
    const latestState = <GetStatusResult>await getLatestState();
    const currentEra = latestState?.last_added_block_info?.era_id;
    if (<number>deployEra + 8 <= <number>currentEra) return;
    unstaking += accountDeploys[i].amount;
  }
  return unstaking;
};
