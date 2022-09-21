import express, { Application } from 'express';
import { indexer } from '@indexer';
import mongoose from 'mongoose';
import { router } from '@v1-routes';
import { eventStream } from '@eventstream';
import { queueWorker } from '@workers';
enum workerType {
  blockQuery = 'BLOCK_QUERY',
  blockSave = 'BLOCK_SAVE',
  deployQuery = 'DEPLOY_QUERY',
  eraSummaryandPerfomanceCalculation = 'ERA_SUMMARY_AND_PERFORMANCE_CALCULATION',
  accountUpdate = 'ACCOUNT_UPDATE'
}
export const Init = () => {
  const mongoURI: string =
    process.env.NODE_ENV == 'dev'
      ? 'mongodb://casper-trench:casper-trench@localhost:27017'
      : (process.env.MONGO_URI as string);
  console.log(mongoURI);
  mongoose
    .connect(mongoURI)
    .then(() => {
      if (process.env.INDEXER == 'true') {
        indexer.start();
      } else {
        eventStream.connect();
      }
      queueWorker.processBlockQuery();
      queueWorker.processSaveBlock();
      queueWorker.processDeployQuery();
      queueWorker.processEraSummaryQuery();
      queueWorker.processValidatorPerformanceCalculation();
      queueWorker.processAccountUpdate();
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
