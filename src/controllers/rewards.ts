import { Reward } from '@models/rewards';
import { SeigniorageAllocation } from 'casper-js-sdk/dist/lib/StoredValue';
import { ethers } from 'ethers';
import { logger } from 'logger';

export const setReward = async (seigniorageAllocation: SeigniorageAllocation, eraId: number) => {
  await Reward.create({
    validatorPublicKey: seigniorageAllocation.Delegator
      ? seigniorageAllocation.Delegator.validatorPublicKey
      : seigniorageAllocation.Validator.validatorPublicKey,
    delegatorPublicKey: seigniorageAllocation.Delegator
      ? seigniorageAllocation.Delegator.delegatorPublicKey
      : '',
    amount: ethers.utils.formatUnits(
      seigniorageAllocation.Delegator
        ? seigniorageAllocation.Delegator.amount
        : seigniorageAllocation.Validator.amount,
      9
    ),
    eraId
  })
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
