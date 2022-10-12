import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
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
export const MatchedEra = mongoose.model('MatchedEras', matchedEraSchema);
