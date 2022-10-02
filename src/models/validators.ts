import mongoose from 'mongoose';
const validatorInfoSchema = new mongoose.Schema({
  name: String,
  email: String,
  icon: String,
  website: String,
  links: [
    {
      tag: String,
      link: String
    }
  ],
  description: String
});
const bidSchema = new mongoose.Schema(
  {
    publicKey: {
      type: String,
      required: true,
      unique: true
    },
    numOfDelegators: Number,
    delegationRate: Number,
    performance: Number,
    totalBid: Number,
    totalDelegated: Number,
    selfStake: Number,
    selfStakePercentage: Number,
    inactive: Boolean,
    networkPercentage: Number,
    rank: Number,
    totalValidatorRewards: Number,
    totalDelegatorRewards: Number,
    information: validatorInfoSchema
  },
  { versionKey: false }
);

const eraValidatorSchema = new mongoose.Schema(
  {
    publicKey: {
      type: String,
      required: true,
      unique: true
    },
    numOfDelegators: Number,
    delegationRate: Number,
    totalBid: Number,
    totalDelegated: Number,
    selfStake: Number,
    selfStakePercentage: Number,
    networkPercentage: Number
  },
  { versionKey: false }
);

export const Bid = mongoose.model('Bid', bidSchema);
export const CurrentEraValidator = mongoose.model('CurrentEraValidator', eraValidatorSchema);
export const NextEraValidator = mongoose.model('NextEraValidator', eraValidatorSchema);
