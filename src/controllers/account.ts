import { CasperServiceByJsonRPC, CLPublicKey, decodeBase16 } from 'casper-js-sdk';
import { ethers } from 'ethers';
import { getAccountBalanceByPublicKey, getUnstakingAmount } from 'utils/accounts';
import { getTotalRewardsByPublicKey } from '@controllers/reward';
import { getDeploysByEntryPointAndPublicKey, getDeploysByTypeAndPublicKey } from './deploy';
import { Account } from '@models/accounts';
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
const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
export const getAccountDetails = async (req, res) => {
  try {
    const { address } = req.params;
    let publicKey: string;
    let accountHash: string;
    // Check if public key or account hash
    if (CLPublicKey.fromHex(address)) {
      publicKey = address;
      accountHash = CLPublicKey.fromHex(address).toAccountHashStr().replace('account-hash-', '');
    } else {
      accountHash = address;
    }

    // TODO determine address type
    const account = await accountDetailCalculation(publicKey);
    res.status(200).json(account);
  } catch (error) {
    res.status(500).send(`Could not fetch account details: ${error}`);
  }
};

export const getAccountDelegations = async (req, res) => {
  try {
    const { address } = req.params;
    const startIndex: number = req.query.startIndex;
    const count: number = req.query.count;
    let publicKey: string;
    let accountHash: string;
    if (CLPublicKey.fromHex(address)) {
      publicKey = address;
      accountHash = CLPublicKey.fromHex(address).toAccountHashStr().replace('account-hash-', '');
    } else {
      accountHash = address;
    }
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
    const startIndex: number = req.query.startIndex;
    const count: number = req.query.count;
    let publicKey: string;
    let accountHash: string;
    if (CLPublicKey.fromHex(address)) {
      publicKey = address;
      accountHash = CLPublicKey.fromHex(address).toAccountHashStr().replace('account-hash-', '');
    } else {
      accountHash = address;
    }
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
            // $cond: {{ $lte: ['$activeDate', newActiveDate] }, newActiveDate, '$activeDate'}
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
    // db.accounts.findOneAndUpdate({ publicKey: '020387ee64318499cf5e116df526265d6059a23c4b86363932290bb853ad947f7534' },[{transactionCount: 1},{$set: {'$activeDate': {$cond: [{ $lte: ['$activeDate', ISODate('2022-09-04T12:31:21.589+00:00')] }, '2022-09-04T12:31:21.589+00:00', '$activeDate']}}}],{ new: true, upsert: true })
  ).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};

const accountDetailCalculation = async (publicKey: string): Promise<AccountDetails> => {
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
      console.log(err);
    });
  const reward = await getTotalRewardsByPublicKey(account.publicKey);
  account.totalReward = reward[0]?.totalReward;
  account.unstaking = await getUnstakingAmount(account.publicKey);
  account.availableBalance = await getAccountBalanceByPublicKey(account.publicKey);
  account.totalBalance = account.availableBalance + account.totalStaked + account.unstaking;
  return account;
};
