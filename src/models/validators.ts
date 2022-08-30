import mongoose from 'mongoose';

const validatorSchema = new mongoose.Schema(
  {
    validatorPublicKey: {
      type: String,
      required: true,
      unique: true
    },
    performance: Number,
    totalValidatorRewards: Number,
    totalDelegatorRewards: Number
  },
  { versionKey: false }
);

export const Validator = mongoose.model('Validator', validatorSchema);
