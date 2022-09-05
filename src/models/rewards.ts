import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    validatorPublicKey: String,
    delegatorPublicKey: String,
    delegatorValidatorPublicKey: String,
    amount: Number,
    eraId: Number,
    eraTimestamp: Date
  },
  { versionKey: false }
);

export const Reward = mongoose.model('Rewards', rewardSchema);
