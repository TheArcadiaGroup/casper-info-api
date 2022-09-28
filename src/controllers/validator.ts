import { Validator } from '@models/validators';
import { addValidatorUpdate } from '@workers/validators';
import { Request, Response } from 'express';
export const updateValidatorPerformance = async (
  publicKey: string,
  performance: number,
  totalValidatorRewards: number,
  totalDelegatorRewards: number
) => {
  await Validator.findOneAndUpdate(
    { validatorPublicKey: publicKey },
    { performance, $inc: { totalValidatorRewards, totalDelegatorRewards } },
    { new: true, upsert: true }
  ).catch((err) => {
    throw new Error(err);
  });
};

export const seedValidators = async (req: Request, res: Response) => {
  const { currentEraId } = req.params;
  for (let i = 0; i <= Number(currentEraId); i++) {
    addValidatorUpdate(i);
  }
  res.status(200).send('Seeding queued');
};

export const getAllValidators = (req: Request, res: Response) => {
  Validator.find()
    .then((validators) => {
      res.status(200).json(validators);
    })
    .catch((error) => {
      res.status(500).send(`Could not fetch validators: ${error}`);
    });
};

export const getValidatorByPublicKeyFromDB = async (validatorPublicKey: string) => {
  Validator.findOne({ validatorPublicKey })
    .then((validator) => {
      return validator;
    })
    .catch((error) => {
      throw new Error(error);
    });
};

export const getValidatorByPublicKey = async (req: Request, res: Response) => {
  const { validatorPublicKey } = req.params;
  try {
    const validator = await getValidatorByPublicKeyFromDB(validatorPublicKey);
    res.status(200).json(validator);
  } catch (error) {
    res.status(500).send(`Could not get validator: ${error}`);
  }
};
