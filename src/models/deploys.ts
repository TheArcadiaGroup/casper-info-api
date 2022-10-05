import mongoose from 'mongoose';

const deploySchema = new mongoose.Schema(
  {
    deployHash: {
      type: String,
      required: true,
      unique: true
    },
    publicKey: { type: String, index: true },
    blockHash: { type: String, index: true },
    timestamp: { type: Date, index: true },
    entryPoint: { type: String, index: true },
    amount: Number,
    cost: Number,
    validator: {
      type: String,
      required: false
    },
    status: String,
    fromAccountHash: {
      type: String,
      required: false,
      index: true
    },
    fromAccountBalance: Number,
    toAccountHash: {
      type: String,
      required: false,
      index: true
    },
    toAccountBalance: Number,
    deployType: { type: String, index: true }
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
