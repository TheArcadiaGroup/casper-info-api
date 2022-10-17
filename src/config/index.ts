import express, { Application } from 'express';
import cors from 'cors';
import { indexer } from '@indexer';
import mongoose from 'mongoose';
import { router } from '@v1-routes';
import { eventStream } from '@eventstream';
import { processBlockQuery, processSaveBlock } from '@workers/blocks';
import { matchDeploys, processDeployQuery, processDeploySave } from '@workers/deploys';
import { eraMatchTrigger, processEraMatch, processEraSummaryQuery } from '@workers/era';
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
  failedRewardSaveHandler,
  failedEraMatchHandler,
  failedDeploySavesHandler,
  failedContractQueriesHandler,
  failedContractSavesHandler
} from '@workers/queueFailureHandler';
import { processRewardSave } from '@workers/rewards';
import { processQueryContract, processSaveContract } from '@workers/contracts';
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
            matchDeploys();
            processDeployQuery();
            processDeploySave();
            failedDeployQueriesHandler();
            failedDeploySavesHandler();
            break;
          case workerType.eraSummaryandPerfomanceCalculation:
            eraMatchTrigger();
            processEraSummaryQuery();
            processValidatorUpdate();
            processRewardSave();
            processEraMatch();
            failedEraSummaryQueriesHandler();
            failedValidatorUpdatesHandler();
            failedRewardSaveHandler();
            failedEraMatchHandler();
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
        eraMatchTrigger();
        validatorInfoFetchCron();
        processBlockQuery();
        processSaveBlock();
        processDeployQuery();
        processDeploySave();
        processQueryContract();
        processSaveContract();
        processEraSummaryQuery();
        processEraMatch();
        processValidatorUpdate();
        processRewardSave();
        processAccountUpdate();
        processValidatorsInfoFetch();
        processBidOrValidatorSave();
        processBidDelegatorSave();
        failedBlockQueriesHandler();
        failedBlockSavesHandler();
        failedDeployQueriesHandler();
        failedDeploySavesHandler();
        failedContractQueriesHandler();
        failedContractSavesHandler();
        failedEraSummaryQueriesHandler();
        failedEraMatchHandler();
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
