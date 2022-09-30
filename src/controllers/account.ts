import { CLPublicKey } from 'casper-js-sdk';
import { ethers } from 'ethers';
import { Request, Response } from 'express';
import { casperService, getCurrentEra } from '@utils';
import { getAccountBalanceByPublicKey, getUnstakingAmount } from '@utils/accounts';
import {
  getEraRewardsByPublicKey,
  getRewardsByPublicKey,
  getTotalRewardsByPublicKey
} from '@controllers/reward';
import { getValidatorByPublicKeyFromDB } from '@controllers/validator';
import { getBlockByPublicKeyFromDB } from '@controllers/block';
import { getDeploysByEntryPointAndPublicKey, getDeploysByTypeAndPublicKey } from '@controllers/deploy';
import { Account } from '@models/accounts';
import { logger } from '@logger';

type AccountDetails = {
  publicKey?: string;
  accountHash?: string;
  addressType?: string;
  availableBalance?: number;
  totalBalance?: number;
  totalStaked?: number;
  unstaking?: number;
  totalReward?: number;
};

export const getTopAccounts = async (req, res) => {
  try {
    const startIndex: number = req.query.startIndex;
    const count: number = req.query.count;
    const topAccounts = await Account.find()
      .sort({ balance: 'desc' })
      .skip(startIndex - 1)
      .limit(count);
    res.status(200).json(topAccounts);
  } catch (error) {
    res.status(500).send(`Could not fetch top accounts: ${error}`);
  }
};

export const getAccountDetails = async (req, res) => {
  try {
    const { address } = req.params;
    const { publicKey, accountHash } = await processPublicKeyAndAccountHash(address);

    // TODO determine address type
    const account = await accountDetailCalculation(publicKey);
    account.accountHash = accountHash;
    res.status(200).json(account);
  } catch (error) {
    res.status(500).send(`Could not fetch account details: ${error}`);
  }
};

export const getAccountTransfers = async (req, res) => {
  try {
    const { address } = req.params;
    const startIndex: number = req.query.startIndex;
    const count: number = req.query.count;
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    const transfers = await getDeploysByTypeAndPublicKey(publicKey, 'transfer', startIndex, count);
    res.status(200).json(transfers);
  } catch (err) {
    res.status(500).send(`Could not fetch transfer history: ${err}`);
  }
};

export const getAccountDeploys = async (req, res) => {
  try {
    const { address } = req.params;
    const startIndex: number = req.query.startIndex;
    const count: number = req.query.count;
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    const deploys = await getDeploysByTypeAndPublicKey(publicKey, 'deploy', startIndex, count);
    res.status(200).json(deploys);
  } catch (err) {
    res.status(500).send(`Could not fetch delegation history: ${err}`);
  }
};

export const getAccountDelegations = async (req, res) => {
  try {
    const { address } = req.params;
    const startIndex: number = req.query.startIndex;
    const count: number = req.query.count;
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    const delegations = await getDeploysByEntryPointAndPublicKey(
      publicKey,
      'delegate',
      startIndex,
      count
    );
    res.status(200).json(delegations);
  } catch (err) {
    res.status(500).send(`Could not fetch delegation history: ${err}`);
  }
};

export const getAccountUndelegations = async (req, res) => {
  try {
    const { address } = req.params;
    const startIndex: number = Number(req.query.startIndex);
    const count: number = Number(req.query.count);
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    const undelegations = await getDeploysByEntryPointAndPublicKey(
      publicKey,
      'undelegate',
      startIndex,
      count
    );
    res.status(200).json(undelegations);
  } catch (err) {
    res.status(500).send(`Could not fetch delegation history: ${err}`);
  }
};

export const getAccountRewards = async (req, res) => {
  try {
    const { address } = req.params;
    const startIndex: number = Number(req.query.startIndex);
    const count: number = Number(req.query.count);
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    const rewards = await getRewardsByPublicKey(publicKey, startIndex, count);
    res.status(200).json(rewards);
  } catch (error) {
    res.status(500).send(`Could not fetch account rewards: ${error}`);
  }
};

export const getAccountEraRewards = async (req, res) => {
  try {
    const { address } = req.params;
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    const currentEra: number = <number>await getCurrentEra();
    const rewards = await getEraRewardsByPublicKey(publicKey, currentEra - 1000);
    res.status(200).json(rewards);
  } catch (error) {
    res.status(500).send(`Could not fetch account rewards: ${error}`);
  }
};

export const updateAccount = async (publicKey: string, newActiveDate: Date) => {
  const accountDetails = await accountDetailCalculation(publicKey);
  const deploys = await getDeploysByTypeAndPublicKey(publicKey, 'deploy');
  await Account.findOneAndUpdate(
    { publicKey },
    [
      {
        $set: {
          publicKey,
          accountHash: CLPublicKey.fromHex(publicKey)
            .toAccountHashStr()
            .replace('account-hash-', ''),
          transferrable: accountDetails.availableBalance,
          stakedAmount: accountDetails.totalStaked,
          balance: accountDetails.totalBalance,
          transactionCount: deploys.length,
          activeDate: {
            $cond: {
              if: { $lte: [Date.parse('$activeDate'), Date.parse(newActiveDate.toLocaleString())] },
              then: newActiveDate,
              else: '$activeDate'
            }
          }
        }
      }
    ],
    { new: true, upsert: true }
  ).catch((err) => {
    throw new Error(err);
  });
};

export const accountDetailCalculation = async (publicKey: string): Promise<AccountDetails> => {
  let account: AccountDetails = { totalStaked: 0 };
  account.publicKey = publicKey;
  await casperService
    .getValidatorsInfo()
    .then((validatorInfoResult) => {
      const { bids } = validatorInfoResult.auction_state;
      bids?.forEach((bid) => {
        if (account.publicKey === bid.public_key) {
          account.totalStaked += Number(ethers.utils.formatUnits(bid.bid.staked_amount, 9));
        }

        bid?.bid?.delegators?.forEach((delegator) => {
          if (account.publicKey === delegator.public_key) {
            account.totalStaked += Number(ethers.utils.formatUnits(delegator.staked_amount, 9));
          }
        });
      });
    })
    .catch((err) => {
      //   TODO handle err
      logger.error({
        accountRPC: {
          publicKey,
          errMessage: `${err}`
        }
      });
      console.log(err);
    });
  const reward = await getTotalRewardsByPublicKey(account.publicKey);
  account.totalReward = reward[0]?.totalReward;
  account.unstaking = await getUnstakingAmount(account.publicKey);
  account.availableBalance = await getAccountBalanceByPublicKey(account.publicKey);
  account.totalBalance = account.availableBalance + account.totalStaked + account.unstaking;
  return account;
};

export const getAccountPublicKeyFromAccountHash = async (accountHash: string) => {
  try {
    const publicKey = await Account.findOne({ accountHash }).select('publicKey -_id');
    return publicKey;
  } catch (error) {
    throw new Error(error);
  }
};

export const processPublicKeyAndAccountHash = async (
  address: string
): Promise<{ publicKey: string; accountHash: string; isPublicKey: boolean }> => {
  try {
    return {
      publicKey: address,
      accountHash: CLPublicKey.fromHex(address).toAccountHashStr().replace('account-hash-', ''),
      isPublicKey: true
    };
  } catch {
    const accountHash = address;
    const publicKeyFromDB = await getAccountPublicKeyFromAccountHash(accountHash);
    return { publicKey: publicKeyFromDB?.publicKey ?? null, accountHash, isPublicKey: false };
  }
};

export const getAccountAddressType = async (req, res) => {
  try {
    const { address } = req.params;
    const { isPublicKey, publicKey } = await processPublicKeyAndAccountHash(address);

    if (isPublicKey) {
      // Find if it is on the validators collection
      const isValidator = await getValidatorByPublicKeyFromDB(address);
      if (isValidator !== null) {
        res.status(200).json({
          type: 'Validator Public Key'
        });
      } else {
        res.status(200).json({
          type: 'Delegator Public Key'
        });
      }
    } else {
      if (isPublicKey === false && publicKey === null) {
        res.status(200).json({
          type: 'Unknown'
        });
      }
      res.status(200).json({
        type: 'Account Hash'
      });
    }
  } catch (error) {
    res.status(500).send(`Couldn't fetch account address info: ${error}`);
  }
};
