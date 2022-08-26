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
  validatorPublicKey: String
});

const rawBlockSchema = new mongoose.Schema({
  block: {}
});
export const Block = mongoose.model('Block', blockSchema);
export const RawBlock = mongoose.model('RawBlock', rawBlockSchema);
