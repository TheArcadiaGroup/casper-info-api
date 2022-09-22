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
export const Init = async () => {
  await mongoose
    .connect(process.env.MONGO_URI as string)
    .then(async () => {
      if (process.env.INDEXER == 'true') {
        console.log(`Worker type: ${process.env.WORKER_TYPE as string}`);
        switch (process.env.WORKER_TYPE as string) {
          case workerType.blockQuery:
            queueWorker.processBlockQuery();
            break;
          case workerType.blockSave:
            queueWorker.processSaveBlock();
            break;
          case workerType.deployQuery:
            queueWorker.processDeployQuery();
            break;
          case workerType.eraSummaryandPerfomanceCalculation:
            queueWorker.processEraSummaryQuery();
            queueWorker.processValidatorPerformanceCalculation();
            break;
          case workerType.accountUpdate:
            queueWorker.processAccountUpdate();
            break;
          default:
            indexer.start();
            break;
        }
      } else {
        eventStream.connect();
        queueWorker.processSaveBlock();
        queueWorker.processDeployQuery();
        queueWorker.processEraSummaryQuery();
        queueWorker.processValidatorPerformanceCalculation();
        queueWorker.processAccountUpdate();
      }
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
