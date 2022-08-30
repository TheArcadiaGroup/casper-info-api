import { CLPublicKey } from 'casper-js-sdk';
import { ethers } from 'ethers';
import { casperClient } from 'utils';

export const getAccountBalanceByPublicKey = async (publicKey: string): Promise<number> => {
  return await casperClient.balanceOfByPublicKey(CLPublicKey.fromHex(publicKey)).then((balance) => {
    return Number(ethers.utils.formatUnits(balance, 9));
  });
};
