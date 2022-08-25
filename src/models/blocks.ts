import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  blockHeight: {
    type: Number,
    required: true,
    unique: true
  },
  blockHash: {
    type: String,
    required: true,
    unique: true
  },
  eraID: Number,
  transfers: Number,
  deploys: Number,
  timestamp: Date,
  validatorPublicKey: String,
  rawData: {}
});

export default mongoose.model('Block', blockSchema);
