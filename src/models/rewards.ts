import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    validatorPublicKey: { type: String, index: true },
    delegatorPublicKey: { type: String, index: true },
    delegatorValidatorPublicKey: { type: String, index: true },
    amount: Number,
    eraId: { type: Number, index: true },
    eraTimestamp: { type: Date, index: true }
  },
  { versionKey: false }
);
const altRewardSchema = new mongoose.Schema(
  {
    reward: { type: {}, index: true },
    eraId: { type: Number, index: true },
    eraTimestamp: { type: Date, index: true }
  },
  { versionKey: false }
);
const matchedEraSchema = new mongoose.Schema(
  { eraId: { type: Number, required: true, unique: true } },
  { versionKey: false }
);
export const Reward = mongoose.model('Rewards', rewardSchema);
export const AltReward = mongoose.model('AltRewards', altRewardSchema);
export const MatchedEra = mongoose.model('MatchedEras', matchedEraSchema);
