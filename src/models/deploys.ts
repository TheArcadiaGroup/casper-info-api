import mongoose from 'mongoose';

const deploySchema = new mongoose.Schema(
  {
    deployHash: {
      type: String,
      required: true,
      unique: true
    },
    publicKey: String,
    blockHash: String,
    timestamp: Date,
    entryPoint: String,
    amount: Number,
    cost: Number,
    validator: {
      type: String,
      required: false
    },
    status: String,
    fromAccountHash: {
      type: String,
      required: false
    },
    toAccountHash: {
      type: String,
      required: false
    },
    deployType: String
  },
  { versionKey: false, _id: false }
);

const rawDeploySchema = new mongoose.Schema(
  {
    deploy: {}
  },
  { versionKey: false, _id: false }
);

export const Deploy = mongoose.model('Deploy', deploySchema);
// export const RawDeploy = mongoose.model('RawDeploy', rawDeploySchema);
