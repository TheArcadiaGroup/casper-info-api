import { GetStatusResult } from 'casper-js-sdk';
import { ethers } from 'ethers';
import { casperService, coinGeckoClient, getLatestState } from '@utils';
import { getTransfersCount } from './deploy';
import { getTotalEraRewardsByEraId } from './reward';

export const getStats = async (req, res) => {
  try {
    let stats = {
      currentBlockHeight: 0,
      currentBlockTime: '',
      currentPrice: 0,
      marketCap: 0,
      circulatingSupply: 0,
      totalSupply: 0,
      activeValidators: 0,
      activeBids: 0,
      totalStakeBonded: 0,
      apy: 0,
      totalTransfers: 0
    };
    const latestState = <GetStatusResult>await getLatestState();
    stats.currentBlockHeight = latestState.last_added_block_info.height;
    stats.currentBlockTime = latestState.last_added_block_info.timestamp;
    console.log(`${stats.currentBlockHeight} ${stats.currentBlockTime}`);
    const marketData = (
      await coinGeckoClient.coins.fetch('casper-network', {
        tickers: false,
        community_data: false,
        developer_data: false,
        localization: false
      })
    ).data.market_data;
    console.log(marketData);
    stats.currentPrice = marketData.current_price.usd;
    stats.marketCap = marketData.market_cap.usd;
    stats.circulatingSupply = marketData.circulating_supply;
    stats.totalSupply = marketData.total_supply;
    const { auction_state } = await casperService.getValidatorsInfo();
    const bids = auction_state.bids;
    const activeBids = bids?.filter((bid: any) => bid.bid?.inactive == false);
    stats.activeValidators = auction_state.era_validators[1].validator_weights.length;
    stats.activeBids = activeBids?.length;
    auction_state.era_validators[1].validator_weights.forEach((validatorWeight) => {
      stats.totalStakeBonded += Number(ethers.utils.formatUnits(validatorWeight.weight, 9));
    });
    console.log(stats.activeBids);
    const latestEraReward =
      (await getTotalEraRewardsByEraId(latestState.last_added_block_info.era_id - 1))[0]
        ?.totalReward || 0;
    console.log(latestEraReward);
    // TODO review APY calculations
    stats.apy =
      100 *
      (Math.pow(
        1 + (((latestEraReward * 12 * 365) / stats.totalStakeBonded) * 100) / 438000,
        4380
      ) -
        1);
    stats.totalTransfers = (await getTransfersCount())[0].count;
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).send(`Could not fetch stats: ${error}`);
  }
};
