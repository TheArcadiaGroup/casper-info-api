// import { EventStreamHandler } from './eventstream';
import express, { Application } from 'express';
import { connectDB } from './config/db';
import { getBlocks } from './controllers/block';
import { EventStreamHandler } from './eventstream';
let eventStreamHandler = null;
setTimeout(async () => {
  const conn = await connectDB();
  eventStreamHandler = conn && new EventStreamHandler();
  eventStreamHandler.connect();
}, 1);
// connectDB;
const app: Application = express();
app.get('/', getBlocks);
app.listen(5000, () => {
  console.log('Server started');
});
