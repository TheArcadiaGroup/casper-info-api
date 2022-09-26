import express, { Application } from 'express';
import { indexer } from '@indexer';
import mongoose from 'mongoose';
import { router } from '@v1-routes';
import { eventStream } from '@eventstream';
import { addBlockToQueryQueue, processBlockQuery, processSaveBlock } from '@workers/blocks';
import { processDeployQuery } from '@workers/deploys';
import { addEraSwitchBlockHash, processEraSummaryQuery } from '@workers/era';
import { processValidatorUpdate } from '@workers/validators';
import { processAccountUpdate } from '@workers/accounts';
import {
  failedBlockQueriesHandler,
  failedBlockSavesHandler,
  failedDeployQueriesHandler,
  failedEraSummaryQueriesHandler,
  failedValidatorUpdatesHandler,
  failedAccountUpdatesHandler
} from '@workers/queFailureHandler';
enum workerType {
  blockQuery = 'BLOCK_QUERY',
  blockSave = 'BLOCK_SAVE',
  deployQuery = 'DEPLOY_QUERY',
  eraSummaryandPerfomanceCalculation = 'ERA_SUMMARY_AND_PERFORMANCE_CALCULATION',
  accountUpdate = 'ACCOUNT_UPDATE'
}
export const Init = async () => {
  await mongoose;
  const mongoURI: string =
    process.env.NODE_ENV == 'dev'
      ? 'mongodb://casper-trench:casper-trench@localhost:27017'
      : process.env.MONGO_URI;
  console.log(mongoURI);
  mongoose
    .connect(mongoURI)
    .then(async () => {
      if (process.env.INDEXER == 'true') {
        console.log(`Worker type: ${process.env.WORKER_TYPE as string}`);
        switch (process.env.WORKER_TYPE as string) {
          case workerType.blockQuery:
            processBlockQuery();
            failedBlockQueriesHandler();
            break;
          case workerType.blockSave:
            processSaveBlock();
            failedBlockSavesHandler();
            break;
          case workerType.deployQuery:
            processDeployQuery();
            failedDeployQueriesHandler();
            break;
          case workerType.eraSummaryandPerfomanceCalculation:
            processEraSummaryQuery();
            processValidatorUpdate();
            failedEraSummaryQueriesHandler();
            failedValidatorUpdatesHandler();
            break;
          case workerType.accountUpdate:
            processAccountUpdate();
            failedAccountUpdatesHandler();
            break;
          default:
            indexer.start();
            break;
        }
      } else {
        eventStream.connect();
        processBlockQuery();
        processSaveBlock();
        processDeployQuery();
        processEraSummaryQuery();
        processValidatorUpdate();
        processAccountUpdate();
        failedBlockQueriesHandler();
        failedBlockSavesHandler();
        failedDeployQueriesHandler();
        failedEraSummaryQueriesHandler();
        failedValidatorUpdatesHandler();
        failedAccountUpdatesHandler();
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
