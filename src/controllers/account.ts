import { CasperServiceByJsonRPC, CLPublicKey } from 'casper-js-sdk';
import { ethers } from 'ethers';
import { getAccountBalanceByPublicKey, getUnstakingAmount } from 'utils/accounts';
import { getTotalRewardsByPublicKey } from '@controllers/reward';
import { getDeploysByTypeAndPublicKey } from './deploy';
type Account = {
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
  const { address } = req.params;
  let account: Account = { totalStaked: 0 };
  // Check if public key or account hash
  if (CLPublicKey.fromHex(address)) {
    account.publicKey = address;
    account.accountHash = CLPublicKey.fromHex(address)
      .toAccountHashStr()
      .replace('account-hash-', '');
  } else {
    account.accountHash = address;
  }
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
  // TODO determine address type
  res.status(200).json(account);
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
    const delegations = await getDeploysByTypeAndPublicKey(publicKey, 'delegate', 1, 10);
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
    const undelegations = await getDeploysByTypeAndPublicKey(publicKey, 'undelegate', 1, 10);
    res.status(200).json(undelegations);
  } catch (err) {
    res.status(500).send(`Could not fetch delegation history: ${err}`);
  }
};
