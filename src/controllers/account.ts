import { Request, Response } from 'express';
import { CLPublicKey } from 'casper-js-sdk';
import { getCurrentEra } from '@utils';
import { getAccountBalanceByAddress, getUnstakingAmount } from '@utils/accounts';
import {
  getEraRewardsByPublicKey,
  getRewardsByPublicKey,
  getTotalRewardsByPublicKey
} from '@controllers/reward';
import {
  getAllBidsFromDB,
  getBidByPublicKeyFromDB,
  getValidatorDelegatorsFromDB
} from '@controllers/validator';
import {
  getDeploysByEntryPointAndPublicKey,
  getDeploysByTypeAndPublicKeyOrAccountHash
} from './deploy';
import { Account } from '@models/accounts';
import {} from '@controllers/block';

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
export const getTopAccounts = async (req: Request, res: Response) => {
  try {
    const { startIndex, count } = req.query;
    const topAccounts = await Account.find()
      .sort({ balance: 'desc' })
      .skip(Number(startIndex) - 1)
      .limit(Number(count));
    res.status(200).json(topAccounts);
  } catch (error) {
    res.status(500).send(`Could not fetch top accounts: ${error}`);
  }
};
export const getAccountDetails = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { publicKey, accountHash } = await processPublicKeyAndAccountHash(address);
    const account = await accountDetailCalculation(publicKey);
    account.accountHash = accountHash;
    res.status(200).json(account);
  } catch (error) {
    res.status(500).send(`Could not fetch account details: ${error}`);
  }
};
export const getAccountTransfers = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { startIndex, count } = req.query;
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    let transfers = await getDeploysByTypeAndPublicKeyOrAccountHash(
      publicKey,
      'transfer',
      Number(startIndex),
      Number(count)
    );
    res.status(200).json(transfers);
  } catch (err) {
    res.status(500).send(`Could not fetch transfer history: ${err}`);
  }
};

export const getAccountDeploys = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { startIndex, count } = req.query;
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    const deploys = await getDeploysByTypeAndPublicKeyOrAccountHash(
      publicKey,
      'deploy',
      Number(startIndex),
      Number(count)
    );
    res.status(200).json(deploys);
  } catch (err) {
    res.status(500).send(`Could not fetch delegation history: ${err}`);
  }
};
export const getAccountDelegations = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { startIndex, count } = req.query;
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    const delegations = await getDeploysByEntryPointAndPublicKey(
      publicKey,
      'delegate',
      Number(startIndex),
      Number(count)
    );
    res.status(200).json(delegations);
  } catch (err) {
    res.status(500).send(`Could not fetch delegation history: ${err}`);
  }
};

export const getAccountUndelegations = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { startIndex, count } = req.query;
    const { publicKey } = await processPublicKeyAndAccountHash(address);
    const undelegations = await getDeploysByEntryPointAndPublicKey(
      publicKey,
      'undelegate',
      Number(startIndex),
      Number(count)
    );
    res.status(200).json(undelegations);
  } catch (err) {
    res.status(500).send(`Could not fetch delegation history: ${err}`);
  }
};

export const getAccountRewards = async (req: Request, res: Response) => {
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

export const getAccountEraRewards = async (req: Request, res: Response) => {
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
  // TODO handle error from getDeploysByTypeAndPublicKeyOrAccountHash
  let deploys = await getDeploysByTypeAndPublicKeyOrAccountHash(publicKey, 'deploy');
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
          transactionCount: deploys?.length,
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
  try {
    let account: AccountDetails = { totalStaked: 0 };
    account.publicKey = publicKey;
    const bids = await getAllBidsFromDB();
    bids?.forEach(async (bid) => {
      if (account.publicKey === bid.publicKey) {
        account.totalStaked += bid.selfStake;
      }
      const delegators = await getValidatorDelegatorsFromDB(bid.publicKey);
      delegators?.forEach((delegator) => {
        if (account.publicKey === delegator.publicKey) {
          account.totalStaked += delegator.stakedAmount;
        }
      });
    });
    const reward = await getTotalRewardsByPublicKey(account.publicKey);
    account.totalReward = reward[0]?.totalReward;
    account.unstaking = await getUnstakingAmount(account.publicKey);
    account.availableBalance = await getAccountBalanceByAddress(account.publicKey);
    account.totalBalance = account.availableBalance + account.totalStaked + account.unstaking;
    return account;
  } catch (error) {
    throw new Error(`Could calculate account details ${error}`);
  }
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

export const getAccountAddressType = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { isPublicKey, accountHash } = await processPublicKeyAndAccountHash(address);

    if (isPublicKey) {
      const bid = await getBidByPublicKeyFromDB(address);
      if (bid !== null) {
        res.status(200).json({
          type: 'Validator Public Key'
        });
      } else {
        res.status(200).json({
          type: 'Delegator Public Key'
        });
      }
    } else if (accountHash) {
      res.status(200).json({
        type: 'Account Hash'
      });
    } else {
      res.status(200).json({
        type: 'Unknown'
      });
    }
  } catch (error) {
    res.status(500).send(`Couldn't fetch account address info: ${error}`);
  }
};

export const getAccountBalance = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const balance = await getAccountBalanceByAddress(address);
    res.status(200).json(balance);
  } catch (error) {
    res.status(500).send(`Could not fetch account balance ${error}`);
  }
};
