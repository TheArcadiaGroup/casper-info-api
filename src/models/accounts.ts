import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  publicKey: {
    type: String,
    unique: true,
    required: true
  },
  accountHash: {
    type: String,
    unique: true,
    required: true
  },
  activeDate: Date,
  transferrable: Number,
  stakedAmount: Number,
  balance: Number,
  transactionCount: Number
});

export const Account = mongoose.model('Account', accountSchema);
