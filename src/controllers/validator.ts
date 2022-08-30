import { Validator } from '@models/validators';

export const updateValidatorPerformance = async (publicKey: string, performance: number) => {
  await Validator.findOneAndUpdate(
    { validatorPublicKey: publicKey },
    { performance },
    { new: true, upsert: true }
  ).catch((err) => {
    throw new Error(err);
  });
};
