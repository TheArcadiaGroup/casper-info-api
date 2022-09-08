import express, { Application } from 'express';
import { indexer } from 'indexer';
import mongoose from 'mongoose';
import { router } from '@v1-routes';
import { eventStream } from '@eventstream';
import { queueWorker } from 'workers';

export const Init = async () => {
  await mongoose
    .connect('mongodb://casper-trench:casper-trench@localhost:27017')
    .then(async () => {
      // queueWorker.addBlockToQueryQueue(1081025);
      // if (process.env.INDEXER == 'true') {
      indexer.start();
      // } else {
      //   eventStream.connect();
      // }
      const app: Application = express();
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(router);
      app.listen(process.env.PORT, () => console.log(`Server running at ${process.env.PORT}`));
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};
