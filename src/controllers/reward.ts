import { Reward } from '@models/rewards';
import { SeigniorageAllocation } from 'casper-js-sdk/dist/lib/StoredValue';
import { ethers } from 'ethers';
import { logger } from '@logger';
import { getSwitchBlocks } from './block';
import { addEraSwitchBlockHash } from '@workers/era';

export const setReward = async (
  seigniorageAllocation: SeigniorageAllocation,
  eraId: number,
  eraTimestamp: Date
) => {
  await Reward.findOneAndUpdate(
    {
      validatorPublicKey: seigniorageAllocation.Validator
        ? seigniorageAllocation.Validator.validatorPublicKey
        : '',
      delegatorPublicKey: seigniorageAllocation.Delegator
        ? seigniorageAllocation.Delegator.delegatorPublicKey
        : '',
      eraId
    },
    {
      validatorPublicKey: seigniorageAllocation.Validator
        ? seigniorageAllocation.Validator.validatorPublicKey
        : '',
      delegatorPublicKey: seigniorageAllocation.Delegator
        ? seigniorageAllocation.Delegator.delegatorPublicKey
        : '',
      delegatorValidatorPublicKey: seigniorageAllocation.Delegator
        ? seigniorageAllocation.Delegator.validatorPublicKey
        : '',
      amount: ethers.utils.formatUnits(
        seigniorageAllocation.Delegator
          ? seigniorageAllocation.Delegator.amount
          : seigniorageAllocation.Validator.amount,
        9
      ),
      eraId,
      eraTimestamp
    },
    { new: true, upsert: true }
  )
    .then((reward) => {
      console.log(reward.eraId);
    })
    .catch((err) => {
      logger.error({
        rewardDB: {
          hash: seigniorageAllocation.Delegator
            ? `Delegator ${seigniorageAllocation.Delegator.delegatorPublicKey}`
            : `Validator ${seigniorageAllocation.Validator.validatorPublicKey}`,
          errMessage: `${err}`
        }
      });
    });
};
export const getBidPerformanceAggregation = async (eraId: number) => {
  return await Reward.aggregate([
    { $match: { eraId: { $gte: eraId - 360 } } },
    { $group: { _id: '$validatorPublicKey', count: { $sum: 1 } } }
  ]).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};

export const getTotalRewardsByPublicKey = async (
  publicKey: string
): Promise<{ id: string; totalReward: number }[]> => {
  return await Reward.aggregate([
    { $match: { $or: [{ validatorPublicKey: publicKey }, { delegatorPublicKey: publicKey }] } },
    { $group: { _id: null, totalReward: { $sum: '$amount' } } },
    { $limit: 1 }
  ]).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};

export const getRewardsByPublicKey = async (
  publicKey: string,
  startIndex: number,
  count: number
) => {
  return await Reward.aggregate([
    { $match: { $or: [{ validatorPublicKey: publicKey }, { delegatorPublicKey: publicKey }] } },
    { $sort: { eraTimestamp: -1 } },
    {
      $group: {
        _id: { $dateToString: { format: '%m/%d/%Y', date: '$eraTimestamp' } },
        totalReward: { $sum: '$amount' }
      }
    },
    { $skip: startIndex - 1 },
    { $limit: count }
  ]).catch((err) => {
    throw new Error(err);
  });
};

export const getEraRewardsByPublicKey = async (publicKey: string, limitEra: number) => {
  return await Reward.aggregate([
    {
      $match: {
        $and: [
          { $or: [{ validatorPublicKey: publicKey }, { delegatorPublicKey: publicKey }] },
          { eraId: { $gte: limitEra } }
        ]
      }
    },
    { $sort: { eraTimestamp: -1 } },
    {
      $group: {
        _id: { $dateToString: { format: '%m/%d/%Y', date: '$eraTimestamp' } },
        totalReward: { $sum: '$amount' }
      }
    }
  ]).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};

export const getTotalEraRewardsByEraId = async (
  eraId: number
): Promise<{ _id: number; totalReward }[]> => {
  return await Reward.aggregate([
    { $match: { eraId } },
    { $group: { _id: '$eraId', totalReward: { $sum: '$amount' } } }
  ]);
};

export const getBidRewards = async (
  validatorPublicKey: string
): Promise<{ _id: null; totalRewards: number }[]> => {
  return await Reward.aggregate([
    { $match: { validatorPublicKey } },
    { $group: { _id: null, totalRewards: { $sum: '$amount' } } }
  ]);
};
export const getBidDelegatorRewards = async (
  validatorPublicKey: string
): Promise<{ _id: null; totalDelegatorRewards: number }[]> => {
  return await Reward.aggregate([
    { $match: { delegatorValidatorPublicKey: validatorPublicKey } },
    { $group: { _id: null, totalDelegatorRewards: { $sum: '$amount' } } }
  ]);
};
export const matchRewards = async () => {
  // setInterval(async () => {
  try {
    let switchBlocks = await getSwitchBlocks();
    const rewardsEras = await Reward.aggregate([{ $group: { _id: '$eraId' } }]);
    rewardsEras?.forEach((rewardsEra) => {
      const index = switchBlocks.findIndex((block) => block.blockHeight === rewardsEra._id);
      switchBlocks.splice(index, 1);
    });
    console.log(switchBlocks.length);
    // switchBlocks = switchBlocks.slice(0, 50);
    switchBlocks?.forEach(async (block) => {
      addEraSwitchBlockHash(block.blockHash, block.timestamp);
    });
  } catch (error) {
    throw new Error(`Could not fetch match rewards: ${error}`);
  }
  // }, 10 * 60 * 1000);
};
