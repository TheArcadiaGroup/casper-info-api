import { MatchedEra, Reward } from '@models/rewards';
import { SeigniorageAllocation } from 'casper-js-sdk/dist/lib/StoredValue';
import { ethers } from 'ethers';
import { logger } from '@logger';
import { getSwitchBlocks } from './block';
import { addEraSwitchBlockHash } from '@workers/era';
import { blockQuery } from '@workers/blocks';
import { rewardSaving } from '@workers/rewards';

export const setReward = async (
  seigniorageAllocation: SeigniorageAllocation,
  eraId: number,
  eraTimestamp: Date
) => {
  try {
    let reward: {
      delegatorPublicKey?: string;
      delegatorValidatorPublicKey?: string;
      validatorPublicKey?: string;
      amount?: number;
    };

    if (seigniorageAllocation?.Delegator) {
      reward = {
        delegatorPublicKey: seigniorageAllocation?.Delegator?.delegatorPublicKey,
        delegatorValidatorPublicKey: seigniorageAllocation?.Delegator?.validatorPublicKey,
        amount: Number(ethers.utils.formatUnits(seigniorageAllocation?.Delegator.amount, 9))
      };
    } else {
      reward = {
        validatorPublicKey: seigniorageAllocation?.Validator?.validatorPublicKey,
        amount: Number(ethers.utils.formatUnits(seigniorageAllocation?.Validator.amount, 9))
      };
    }

    await Reward.findOneAndUpdate(
      {
        reward,
        eraId,
        eraTimestamp
      },
      {
        reward,
        eraId,
        eraTimestamp
      },
      {
        new: true,
        upsert: true
      }
    );
  } catch (error) {
    logger.error({
      altRewardDB: {
        hash: seigniorageAllocation.Delegator
          ? `Delegator ${seigniorageAllocation.Delegator.delegatorPublicKey}`
          : `Validator ${seigniorageAllocation.Validator.validatorPublicKey}`,
        errMessage: `${error}`
      }
    });
  }
};
export const setMatchedEra = async (eraId: number) => {
  await MatchedEra.create({ eraId });
};
export const getLatestMatchedEra = async () => {
  return await MatchedEra.find().sort({ eraId: 'desc' }).limit(1);
};
export const getBidPerformanceAggregation = async (eraId: number) => {
  return await Reward.aggregate([
    { $match: { eraId: { $gte: eraId - 360 } } },
    { $group: { _id: '$reward.validatorPublicKey', count: { $sum: 1 } } }
  ]);
};
export const getTotalRewardsByPublicKey = async (
  publicKey: string
): Promise<{ id: string; totalReward: number }[]> => {
  return await Reward.aggregate([
    {
      $match: {
        $or: [
          { 'reward.validatorPublicKey': publicKey },
          { 'reward.delegatorPublicKey': publicKey }
        ]
      }
    },
    { $group: { _id: null, totalReward: { $sum: '$reward.amount' } } },
    { $limit: 1 }
  ]);
};
export const getRewardsByPublicKey = async (
  publicKey: string,
  startIndex: number,
  count: number
) => {
  return await Reward.aggregate([
    {
      $match: {
        $or: [
          { 'reward.validatorPublicKey': publicKey },
          { 'reward.delegatorPublicKey': publicKey }
        ]
      }
    },
    { $sort: { eraTimestamp: -1 } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$eraTimestamp' } },
        totalReward: { $sum: '$reward.amount' }
      }
    },
    { $sort: { _id: -1 } },
    { $skip: startIndex - 1 },
    { $limit: count }
  ]);
};
export const getEraRewardsByPublicKey = async (publicKey: string, limitEra: number) => {
  return await Reward.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              { 'reward.validatorPublicKey': publicKey },
              { 'reward.delegatorPublicKey': publicKey }
            ]
          },
          { eraId: { $gte: limitEra } }
        ]
      }
    },
    { $sort: { eraTimestamp: -1 } },
    {
      $group: {
        _id: '$eraTimestamp',
        totalReward: { $sum: '$reward.amount' }
      }
    },
    { $sort: { _id: -1 } }
  ]);
};
export const getTotalEraRewardsByEraId = async (
  eraId: number
): Promise<{ _id: number; totalReward }[]> => {
  return await Reward.aggregate([
    { $match: { eraId } },
    { $group: { _id: '$eraId', totalReward: { $sum: '$reward.amount' } } }
  ]);
};
export const getBidRewards = async (
  validatorPublicKey: string
): Promise<{ _id: null; totalRewards: number }[]> => {
  return await Reward.aggregate([
    { $match: { 'reward.validatorPublicKey': validatorPublicKey } },
    { $group: { _id: null, totalRewards: { $sum: '$reward.amount' } } }
  ]);
};
export const getBidDelegatorRewards = async (
  validatorPublicKey: string
): Promise<{ _id: null; totalDelegatorRewards: number }[]> => {
  return await Reward.aggregate([
    { $match: { 'reward.delegatorValidatorPublicKey': validatorPublicKey } },
    { $group: { _id: null, totalDelegatorRewards: { $sum: '$reward.amount' } } }
  ]);
};
export const matchRewards = async () => {
  setInterval(async () => {
    try {
      let switchBlocks = await getSwitchBlocks();
      let missingEras = await getMissingEras(switchBlocks[0].eraID);
      missingEras = missingEras.slice(0, 20);
      missingEras.forEach((era) => {
        const block = switchBlocks.find((block) => block.eraID === era);
        console.log(era, block.eraID, block.blockHash);
        block && addEraSwitchBlockHash(block?.blockHash, block?.timestamp);
      });
    } catch (error) {
      logger.error({ matchRewards: { errMessage: error } });
    }
  }, 5000);
};
export const getMissingEras = async (currentEraId: number) => {
  let missingEras = [];
  for (let i = 0; i <= currentEraId; i++) {
    const reward = await Reward.aggregate([
      { $match: { eraId: i } },
      { $sort: { eraId: -1 } },
      { $group: { _id: '$eraId' } }
    ]);
    if (reward.length < 1) {
      missingEras.push(i);
    }
  }
  return missingEras;
};
export const getEraRewards = async (eraId: number) => {
  return await Reward.find({ eraId });
};
