import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  blockHash: {
    type: String,
    required: true
  }
});

export default mongoose.model('Block', blockSchema);
