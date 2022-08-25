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
  cost: Number,
  rawData: {}
});

export default mongoose.model('Deploy', deploySchema);
