"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    await mongoose_1.default
        .connect('mongodb+srv://casper-trench:sXihiV4rEKbTRDjJ@caspertrench.3zk1dmc.mongodb.net/casper-trench?retryWrites=true&w=majority')
        .then((conn) => {
        console.log(conn.connection.host);
    })
        .catch((err) => {
        console.log(err);
        process.exit(1);
    });
};
exports.connectDB = connectDB;
