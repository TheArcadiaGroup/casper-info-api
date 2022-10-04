import { Bid, CurrentEraValidator, Delegators, NextEraValidator } from '@models/validators';
import { addValidatorUpdate } from '@workers/validators';
import { Request, Response } from 'express';
export const setBid = async (bid: any) => {
  try {
    await Bid.findOneAndUpdate(
      { publicKey: bid.publicKey },
      {
        publicKey: bid.publicKey,
        numOfDelegators: bid.numOfDelegators,
        delegationRate: bid.delegationRate,
        totalBid: bid.totalBid,
        totalDelegated: bid.totalDelegated,
        selfStake: bid.selfStake,
        selfStakePercentage: bid.selfStakePercentage,
        inactive: bid.inactive,
        networkPercentage: bid.networkPercentage,
        rank: bid.rank
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw new Error(`Could not save bid: ${error}`);
  }
};
export const setCurrentEraValidator = async (currentEraValidator: any) => {
  try {
    await CurrentEraValidator.findOneAndUpdate(
      { publicKey: currentEraValidator.publicKey },
      {
        publicKey: currentEraValidator.publicKey,
        eraId: currentEraValidator.eraId,
        numOfDelegators: currentEraValidator.numOfDelegators,
        delegationRate: currentEraValidator.delegationRate,
        totalBid: currentEraValidator.totalBid,
        selfStake: currentEraValidator.selfStake,
        selfStakePercentage: currentEraValidator.selfStakePercentage,
        networkPercentage: currentEraValidator.networkPercentage,
        rank: currentEraValidator.rank
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw new Error(`Could not save current era validator: ${error}`);
  }
};
export const setNextEraValidator = async (nextEraValidator: any) => {
  try {
    await NextEraValidator.findOneAndUpdate(
      { publicKey: nextEraValidator.publicKey },
      {
        publicKey: nextEraValidator.publicKey,
        eraId: nextEraValidator.eraId,
        numOfDelegators: nextEraValidator.numOfDelegators,
        delegationRate: nextEraValidator.delegationRate,
        totalBid: nextEraValidator.totalBid,
        selfStake: nextEraValidator.selfStake,
        selfStakePercentage: nextEraValidator.selfStakePercentage,
        networkPercentage: nextEraValidator.networkPercentage,
        rank: nextEraValidator.rank
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw new Error(`Could not save current era validator: ${error}`);
  }
};
export const setDelegator = async (delegator: any) => {
  try {
    // console.log('Delegator to save', delegator);
    await Delegators.findOneAndUpdate(
      { publicKey: delegator.publicKey, validatorPublicKey: delegator.validatorPublicKey },
      {
        publicKey: delegator.publicKey,
        validatorPublicKey: delegator.validatorPublicKey,
        stakedAmount: delegator.stakedAmount,
        bondingPurse: delegator.bondingPurse,
        delegatee: delegator.delegatee
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    throw new Error(`Could not save current era validator: ${error}`);
  }
};
export const updateBidPerformanceAndRewards = async (
  publicKey: string,
  performance: number,
  totalValidatorRewards: number,
  totalDelegatorRewards: number
) => {
  await Bid.findOneAndUpdate(
    { publicKey },
    { performance, $inc: { totalValidatorRewards, totalDelegatorRewards } },
    { new: true, upsert: true }
  ).catch((err) => {
    throw new Error(err);
  });
};
export const seedBidRewards = async (req: Request, res: Response) => {
  const { currentEraId } = req.params;
  for (let i = 0; i <= Number(currentEraId); i++) {
    addValidatorUpdate(i);
  }
  res.status(200).send('Seeding queued');
};
export const getAllBidsFromDB = async () => {
  try {
    return await Bid.find().sort({ totalBid: `desc` });
  } catch (error) {
    throw new Error(`Could not fetch all bids`);
  }
};
export const getAllBids = async (req: Request, res: Response) => {
  try {
    const bids = await getAllBidsFromDB();
    res.status(200).json(bids);
  } catch (error) {
    res.status(500).send(`Could not fetch bids: ${error}`);
  }
};
export const getAllCurrentEraValidatorsFromDB = async () => {
  try {
    return await CurrentEraValidator.find().sort({ totalBid: `desc` });
  } catch (error) {
    throw new Error(`Could not fetch all bids`);
  }
};
export const getAllCurrentEraValidators = async (req: Request, res: Response) => {
  try {
    const validators = await getAllCurrentEraValidatorsFromDB();
    res.status(200).json(validators);
  } catch (error) {
    res.status(500).send(`Could not fetch bids: ${error}`);
  }
};
export const getAllNextEraValidatorsFromDB = async () => {
  try {
    return await NextEraValidator.find().sort({ totalBid: `desc` });
  } catch (error) {
    throw new Error(`Could not fetch all bids`);
  }
};
export const getAllNextEraValidators = async (req: Request, res: Response) => {
  try {
    const validators = await getAllNextEraValidatorsFromDB();
    res.status(200).json(validators);
  } catch (error) {
    res.status(500).send(`Could not fetch bids: ${error}`);
  }
};
export const getValidatorDelegatorsFromDB = async (validatorPublicKey: string) => {
  try {
    return await Delegators.find({ validatorPublicKey }).sort({ stakedAmount: 'desc' });
  } catch (error) {
    throw new Error(`Could not fetch all bids`);
  }
};
export const getValidatorDelegators = async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;
    const delegators = await getValidatorDelegatorsFromDB(publicKey);
    res.status(200).json(delegators);
  } catch (error) {
    res.status(500).send(`Could not fetch bids: ${error}`);
  }
};
export const getBidByPublicKeyFromDB = async (publicKey: string) => {
  try {
    return await Bid.findOne({ publicKey });
  } catch (error) {
    throw new Error(`Could not fetch bid from DB: ${error}`);
  }
};
export const getBidByPublicKey = async (req: Request, res: Response) => {
  const { publicKey } = req.params;
  try {
    const validator = await getBidByPublicKeyFromDB(publicKey);
    res.status(200).json(validator);
  } catch (error) {
    res.status(500).send(`Could not get validator: ${error}`);
  }
};
