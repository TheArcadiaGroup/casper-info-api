import { CasperServiceByJsonRPC, CLPublicKey, GetStatusResult } from 'casper-js-sdk';
import { ethers } from 'ethers';
import { getBlockEra, getLatestState } from 'utils';
import { getAccountBalanceByPublicKey } from 'utils/accounts';
import { getDeploysByTypeAndPublicKey } from './deploy';
import { getTotalRewardsByPublicKey } from './reward';
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

const getUnstakingAmount = async (publicKey): Promise<number> => {
  const accountDeploys = await getDeploysByTypeAndPublicKey(publicKey, 'undelegate');
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
