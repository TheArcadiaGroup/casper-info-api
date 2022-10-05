import {
  getBidDelegatorRewardsByEraId,
  getBidPerformanceAggregation,
  getBidRewardsByEraId
} from '@controllers/reward';
import {
  setBid,
  setCurrentEraValidator,
  setDelegator,
  setNextEraValidator,
  updateBidPerformanceAndRewards
} from '@controllers/validator';
import { casperService } from '@utils';
import Bull from 'bull';
import { ValidatorsInfoResult } from 'casper-js-sdk';
import { ethers } from 'ethers';
export type Bid = {
  publicKey: string;
  numOfDelegators: number;
  delegationRate: number;
  totalBid: number;
  totalDelegated: number;
  selfStake: number;
  selfStakePercentage: number;
  inactive: boolean;
  networkPercentage: number;
  rank?: number;
};
type EraValidator = {
  publicKey: string;
  eraId: number;
  numOfDelegators: number;
  delegationRate: number;
  totalBid: number;
  selfStake: number;
  selfStakePercentage: number;
  networkPercentage: number;
  rank?: number;
};
type Delegator = {
  publicKey?: string;
  validatorPublicKey?: string;
  stakedAmount?: number;
  bondingPurse?: string;
  delegatee?: string;
};

export const validatorsInfoFetch = new Bull('validators-info', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const bidOrValidatorSave = new Bull('bid-or-validator-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const bidPerformanceAndRewardsUpdate = new Bull('validator-update', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const bidDelegatorSave = new Bull('bid-delegator-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addBidDelegatorSave = async (delegator: any) => {
  await bidDelegatorSave.add(delegator, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};
export const processBidDelegatorSave = async () => {
  bidDelegatorSave.process(50, async (job, done) => {
    setDelegator(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
export const addBidOrValidatorSave = async (
  validator,
  dataType: 'bid' | 'current-era' | 'next-era'
) => {
  await bidOrValidatorSave.add(
    { validator, dataType },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processBidOrValidatorSave = async () => {
  bidOrValidatorSave.process(50, async (job, done) => {
    const { validator, dataType } = job.data;
    switch (dataType) {
      case 'bid':
        setBid(validator)
          .then(() => {
            done();
          })
          .catch((err) => done(new Error(err)));
        break;
      case 'current-era':
        setCurrentEraValidator(validator)
          .then(() => {
            done();
          })
          .catch((err) => done(new Error(err)));
        break;
      case 'next-era':
        setNextEraValidator(validator)
          .then(() => {
            done();
          })
          .catch((err) => done(new Error(err)));
        break;
    }
  });
};
export const addValidatorsInfoFetch = async () => {
  await validatorsInfoFetch.add(
    {},
    {
      removeOnComplete: true,
      removeOnFail: 1000,
      attempts: 10
    }
  );
};
export const validatorInfoFetchCron = () => {
  setInterval(async () => {
    await addValidatorsInfoFetch();
  }, 10 * 60 * 1000);
};
export const processValidatorsInfoFetch = async () => {
  validatorsInfoFetch.process(async (job, done) => {
    fetchValidatorsInfo()
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
export const addValidatorUpdate = async (eraId: number) => {
  await bidPerformanceAndRewardsUpdate.add(eraId, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};
export const processValidatorUpdate = async () => {
  bidPerformanceAndRewardsUpdate.process(50, async (job, done) => {
    updateBid(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
export const updateBid = async (eraId: number) => {
  const validatorPerformanceAggregation = await getBidPerformanceAggregation(eraId);
  validatorPerformanceAggregation?.forEach(async (validator) => {
    const totalValidatorRewards: number =
      (await getBidRewardsByEraId(validator._id, eraId))[0]?.totalRewards || 0;
    const totalDelegatorRewards: number =
      (await getBidDelegatorRewardsByEraId(validator._id, eraId))[0]?.totalDelegatorRewards || 0;
    validator._id &&
      (await updateBidPerformanceAndRewards(
        validator._id,
        validator.count / 360,
        totalValidatorRewards,
        totalDelegatorRewards
      ));
  });
};
export const fetchValidatorsInfo = async () => {
  try {
    let bidValidators: Bid[] = [];
    let currentEraValidators: EraValidator[] = [];
    let nextEraValidators: EraValidator[] = [];
    const validatorsInfoResult: ValidatorsInfoResult = await casperService.getValidatorsInfo();
    const bids: any = validatorsInfoResult.auction_state.bids;
    const eraValidatorsInfo = validatorsInfoResult.auction_state.era_validators;
    let totalWeights: number[] = [0, 0];
    eraValidatorsInfo.forEach((eraValidatorInfo, i) => {
      eraValidatorInfo.validator_weights.forEach((validatorWeight) => {
        totalWeights[i] += Number(ethers.utils.formatUnits(validatorWeight.weight, 9));
      });
    });
    bids &&
      bids.forEach((bid) => {
        const selfStake = Number(ethers.utils.formatUnits(bid.bid.staked_amount, 9));
        let totalDelegated = 0;
        bid?.bid?.delegators?.forEach((delegator) => {
          let _delegator: Delegator = {
            publicKey: delegator.public_key,
            validatorPublicKey: bid.public_key,
            stakedAmount: Number(ethers.utils.formatUnits(delegator.staked_amount, 9)),
            bondingPurse: delegator.bonding_purse,
            delegatee: delegator.delegatee
          };
          addBidDelegatorSave(_delegator);
          totalDelegated += Number(ethers.utils.formatUnits(delegator.staked_amount, 9));
        });
        const totalBid = selfStake + totalDelegated;
        const selfStakePercentage = (selfStake / totalBid) * 100;

        bidValidators.push({
          publicKey: bid.public_key,
          numOfDelegators: bid?.bid?.delegators?.length,
          delegationRate: bid.bid?.delegation_rate,
          totalBid,
          totalDelegated,
          selfStake,
          selfStakePercentage,
          networkPercentage: 0,
          inactive: bid.bid.inactive
        });
      });

    bidValidators = bidValidators.sort((a, b) => b.totalBid - a.totalBid);
    bidValidators &&
      bidValidators.forEach((bid, i) => {
        bid.rank = i + 1;
      });
    eraValidatorsInfo.forEach((eraValidatorInfo, i) => {
      eraValidatorInfo.validator_weights.forEach((validatorWeight) => {
        const totalBid = Number(ethers.utils.formatUnits(validatorWeight.weight, 9));
        let networkPercentage = (totalBid / totalWeights[i]) * 100;
        if (i == 0) {
          currentEraValidators.push({
            publicKey: validatorWeight.public_key,
            eraId: eraValidatorInfo.era_id,
            selfStake: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).selfStake,
            delegationRate: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).delegationRate,
            numOfDelegators: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).numOfDelegators,
            totalBid,
            selfStakePercentage: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).selfStakePercentage,
            networkPercentage,
            rank: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).rank
          });
          bidValidators.find(
            (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
          ).networkPercentage = networkPercentage;
        } else {
          nextEraValidators.push({
            publicKey: validatorWeight.public_key,
            eraId: eraValidatorInfo.era_id,
            selfStake: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).selfStake,
            delegationRate: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).delegationRate,
            numOfDelegators: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).numOfDelegators,
            totalBid,
            selfStakePercentage: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).selfStakePercentage,
            networkPercentage,
            rank: bidValidators.find(
              (bidValidator) => bidValidator.publicKey == validatorWeight.public_key
            ).rank
          });
        }
      });
    });
    bidValidators.forEach((bid) => {
      addBidOrValidatorSave(bid, 'bid');
    });
    currentEraValidators.forEach((currentEraValidator) => {
      addBidOrValidatorSave(currentEraValidator, 'current-era');
    });
    nextEraValidators.forEach((nextEraValidator) => {
      addBidOrValidatorSave(nextEraValidator, 'next-era');
    });
  } catch (error) {
    throw new Error(`Could not fetch validators info: ${error}`);
  }
};
