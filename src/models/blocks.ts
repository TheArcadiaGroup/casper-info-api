import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  {
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
