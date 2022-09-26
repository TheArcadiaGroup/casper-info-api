import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  {
    blockHeight: {
      type: Number,
      required: true,
      unique: true
    },
    blockHash: String,
    eraID: Number,
    transfers: Number,
    deploys: Number,
    timestamp: Date,
    isSwitchBlock: Boolean,
    validatorPublicKey: String
  },
  { versionKey: false, _id: false }
);

const rawBlockSchema = new mongoose.Schema(
  {
    block: {}
  },
  { versionKey: false, _id: false }
);
export const Block = mongoose.model('Block', blockSchema);
// export const RawBlock = mongoose.model('RawBlock', rawBlockSchema);
