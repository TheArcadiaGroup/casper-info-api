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
    totalDelegatorRewards: Number,
    information: {
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
    }
  },
  { versionKey: false }
);

export const Validator = mongoose.model('Validator', validatorSchema);
