import { Reward } from '@models/rewards';
import { SeigniorageAllocation } from 'casper-js-sdk/dist/lib/StoredValue';
import { ethers } from 'ethers';
import { logger } from 'logger';

export const setReward = async (seigniorageAllocation: SeigniorageAllocation, eraId: number) => {
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
      eraId
    },
    { new: true, upsert: true }
  )
    // .then((reward) => {
    //   logger.info(reward);
    // })
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
//  Promise<{ _id: string; count: number }[]>;
export const getValidatorPerformanceAggregation = async (eraId: number) => {
  console.log('Calculation');
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
    // { $match: { delegatorPublicKey: publicKey } },
    { $group: { _id: null, totalReward: { $sum: '$reward' } } },
    { $limit: 1 }
  ]).catch((err) => {
    // TODO handle error
    throw new Error(err);
  });
};
