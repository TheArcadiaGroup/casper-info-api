import express, { Application } from 'express';
import { indexer } from '@indexer';
import mongoose from 'mongoose';
import { router } from '@v1-routes';
import { eventStream } from '@eventstream';
import { processBlockQuery, processSaveBlock } from '@workers/blocks';
import { processDeployQuery } from '@workers/deploys';
import { processEraSummaryQuery } from '@workers/era';
import { processValidatorPerformanceCalculation } from '@workers/validators';
import { processAccountUpdate } from '@workers/accounts';
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
            processBlockQuery();
            break;
          case workerType.blockSave:
            processSaveBlock();
            break;
          case workerType.deployQuery:
            processDeployQuery();
            break;
          case workerType.eraSummaryandPerfomanceCalculation:
            processEraSummaryQuery();
            processValidatorPerformanceCalculation();
            break;
          case workerType.accountUpdate:
            processAccountUpdate();
            break;
          default:
            indexer.start();
            break;
        }
      } else {
        eventStream.connect();
        processSaveBlock();
        processDeployQuery();
        processEraSummaryQuery();
        processValidatorPerformanceCalculation();
        processAccountUpdate();
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
