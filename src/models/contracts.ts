import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    contractHash: { type: String, required: true, unique: true },
    contractPackageHash: { type: String, required: true, unique: true },
    contractWasmHash: { type: String, required: true, unique: true },
    namedKeys: [{ name: String, key: String }],
    entryPoints: [
      {
        name: String,
        signature: [{ name: String, clType: String }],
        ret: String,
        access: String,
        entryPointType: String
      }
    ],
    contractPackage: {
      accessKey: String,
      versions: [{ protocolVersionMajor: Number, contractVersion: Number }],
      disabledVersions: [{ protocolVersionMajor: Number, contractVersion: Number }],
      groups: [{ group: String, keys: [String] }]
    },
    protocolVersion: String,
    name: String,
    contractType: String,
    owner: String,
    deploys: Number,
    timestamp: Date
  },
  { versionKey: false }
);
