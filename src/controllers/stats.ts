import { GetStatusResult } from 'casper-js-sdk';
import { ethers } from 'ethers';
import { casperService, coinGeckoClient, getLatestState } from '@utils';
import { getTransfersCount } from './deploy';
import { getTotalEraRewardsByEraId } from './reward';
import {
  getAllBidsFromDB,
  getAllCurrentEraValidators,
  getAllCurrentEraValidatorsFromDB
} from './validator';

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
    const bids = await getAllBidsFromDB();
    const activeBids = bids?.filter((bid: any) => bid?.inactive == false);
    const currentEraValidators = await getAllCurrentEraValidatorsFromDB();
    stats.activeValidators = currentEraValidators.length;
    stats.activeBids = activeBids?.length;
    currentEraValidators?.forEach((validator) => {
      stats.totalStakeBonded += validator.totalBid;
    });
    // TODO handle error from getTransfersCount
    stats.totalTransfers = (await getTransfersCount())[0].count;
    const marketData = (
      await coinGeckoClient.coins.fetch('casper-network', {
        // tickers: false,
        // community_data: false,
        // developer_data: false,
        // localization: false
      })
    ).data.market_data;
    stats.currentPrice = marketData?.current_price?.usd;
    stats.marketCap = marketData?.market_cap?.usd;
    stats.circulatingSupply = marketData?.circulating_supply;
    stats.totalSupply = marketData?.total_supply;

    const latestEraReward =
      (await getTotalEraRewardsByEraId(latestState.last_added_block_info.era_id - 1))[0]
        ?.totalReward || 0;
    // TODO review APY calculations
    stats.apy =
      100 *
      (Math.pow(
        1 + (((latestEraReward * 12 * 365) / stats.totalStakeBonded) * 100) / 438000,
        4380
      ) -
        1);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).send(`Could not fetch stats: ${error}`);
  }
};
