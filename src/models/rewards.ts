import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    reward: { type: {} },
    eraId: { type: Number, index: true },
    eraTimestamp: { type: Date, index: true }
  },
  { versionKey: false }
);
// Add indexes
rewardSchema.index({
  'reward.delegatorPublicKey': 1
});
rewardSchema.index({
  'reward.delegatorValidatorPublicKey': 1
});
rewardSchema.index({
  'reward.validatorPublicKey': 1
});
const matchedEraSchema = new mongoose.Schema(
  { eraId: { type: Number, required: true, unique: true } },
  { versionKey: false }
);
export const Reward = mongoose.model('Rewards', rewardSchema);
export const MatchedEra = mongoose.model('MatchedEras', matchedEraSchema);
