import mongoose from 'mongoose';

const deploySchema = new mongoose.Schema({
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
  cost: Number
});

const rawDeploySchema = new mongoose.Schema({
  deploy: {}
});

export const Deploy = mongoose.model('Deploy', deploySchema);
export const RawDeploy = mongoose.model('RawDeploy', rawDeploySchema);
