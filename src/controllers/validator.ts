import { Bid } from '@models/validators';
import { addValidatorUpdate } from '@workers/validators';
import { Request, Response } from 'express';
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

export const getAllBids = (req: Request, res: Response) => {
  Bid.find()
    .then((validators) => {
      res.status(200).json(validators);
    })
    .catch((error) => {
      res.status(500).send(`Could not fetch validators: ${error}`);
    });
};

export const getBidByPublicKeyFromDB = async (publicKey: string) => {
  Bid.findOne({ publicKey })
    .then((validator) => {
      return validator;
    })
    .catch((error) => {
      throw new Error(error);
    });
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
