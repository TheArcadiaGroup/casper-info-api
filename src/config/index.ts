import express, { Application } from 'express';
import cors from 'cors';
import { indexer } from '@indexer';
import mongoose from 'mongoose';
import { router } from '@v1-routes';
import { eventStream } from '@eventstream';
import { processBlockQuery, processSaveBlock } from '@workers/blocks';
import { processDeployQuery } from '@workers/deploys';
import { processEraSummaryQuery } from '@workers/era';
import {
  processBidDelegatorSave,
  processBidOrValidatorSave,
  processValidatorsInfoFetch,
  processValidatorUpdate,
  validatorInfoFetchCron
} from '@workers/validators';
import { processAccountUpdate } from '@workers/accounts';
import {
  failedBlockQueriesHandler,
  failedBlockSavesHandler,
  failedDeployQueriesHandler,
  failedEraSummaryQueriesHandler,
  failedValidatorUpdatesHandler,
  failedAccountUpdatesHandler,
  failedValidatorInforFetchHandler,
  failedBidOrValidatorSaveHandler,
  failedBidDelegatorSaveHandler,
  failedRewardSaveHandler
} from '@workers/queueFailureHandler';
import { getSwitchBlocks } from '@controllers/block';
import { matchRewards } from '@controllers/reward';
import { processRewardSave } from '@workers/rewards';
enum workerType {
  blockQuery = 'BLOCK_QUERY',
  blockSave = 'BLOCK_SAVE',
  deployQuery = 'DEPLOY_QUERY',
  eraSummaryandPerfomanceCalculation = 'ERA_SUMMARY_AND_PERFORMANCE_CALCULATION',
  accountUpdate = 'ACCOUNT_UPDATE'
}
export const Init = async () => {
  const mongoURI: string =
    process.env.NODE_ENV == 'dev' ? 'mongodb://localhost:27017' : process.env.MONGO_URI;
  mongoose
    .connect(mongoURI, {
      user: process.env.MONGO_INITDB_ROOT_USERNAME,
      pass: process.env.MONGO_INITDB_ROOT_PASSWORD,
      dbName: process.env.MONGO_INITDB_DATABASE
    })
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
            // matchRewards();
            processEraSummaryQuery();
            processValidatorUpdate();
            processRewardSave();
            failedEraSummaryQueriesHandler();
            failedValidatorUpdatesHandler();
            failedRewardSaveHandler();
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
        validatorInfoFetchCron();
        matchRewards();
        processBlockQuery();
        processSaveBlock();
        processDeployQuery();
        processEraSummaryQuery();
        processValidatorUpdate();
        processRewardSave();
        processAccountUpdate();
        processValidatorsInfoFetch();
        processBidOrValidatorSave();
        processBidDelegatorSave();
        failedBlockQueriesHandler();
        failedBlockSavesHandler();
        failedDeployQueriesHandler();
        failedEraSummaryQueriesHandler();
        failedValidatorUpdatesHandler();
        failedAccountUpdatesHandler();
        failedValidatorInforFetchHandler();
        failedBidOrValidatorSaveHandler();
        failedBidDelegatorSaveHandler();
        failedRewardSaveHandler();
      }
      const app: Application = express();
      app.use(cors(), express.json(), express.urlencoded({ extended: true }), router);
      app.listen(process.env.PORT, () => console.log(`Server running at ${process.env.PORT}`));
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};

// mongodb+srv://casper-trench:casper-trench@localhost:27017/casper-info?retryWrites=true&w=majority
