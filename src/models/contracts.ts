import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    contractHash: { type: String, required: true, unique: true },
    contractPackageHash: { type: String, required: true, unique: true },
    contractWasmHash: { type: String, required: true },
    namedKeys: [{}],
    entryPoints: [{}],
    contractPackage: {},
    protocolVersion: String,
    name: String,
    contractType: String,
    owner: String,
    deploys: Number,
    rawData: {},
    timestamp: Date
  },
  { versionKey: false }
);

export const Contract = mongoose.model('Contract', contractSchema);
