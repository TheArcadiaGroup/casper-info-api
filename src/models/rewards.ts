import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    validatorPublicKey: { type: String, index: true },
    delegatorPublicKey: { type: String, index: true },
    delegatorValidatorPublicKey: { type: String, index: true },
    amount: Number,
    eraId: { type: Number, index: true },
    eraTimestamp: Date
  },
  { versionKey: false }
);

export const Reward = mongoose.model('Rewards', rewardSchema);
Reward.createIndexes();
