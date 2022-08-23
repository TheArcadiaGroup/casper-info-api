"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { EventStreamHandler } from './eventstream';
const express_1 = __importDefault(require("express"));
const db_1 = require("./config/db");
const eventstream_1 = require("./eventstream");
db_1.connectDB;
const app = (0, express_1.default)();
const eventStreamHandler = new eventstream_1.EventStreamHandler();
eventStreamHandler.connect();
app.listen(5000, () => {
    console.log('Server started');
});
