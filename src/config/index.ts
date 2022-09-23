import express, { Application } from 'express';
import { indexer } from '@indexer';
import mongoose from 'mongoose';
import { router } from '@v1-routes';
import { eventStream } from '@eventstream';
import {
  addBlockToQueryQueue,
  blockQuery,
  blockSave,
  processBlockQuery,
  processSaveBlock
} from '@workers/blocks';
import { processDeployQuery, queryAndSaveDeploy } from '@workers/deploys';
import { addEraSwitchBlockHash, processEraSummaryQuery, queryEraSummary } from '@workers/era';
import { processValidatorUpdate, validatorUpdate } from '@workers/validators';
import { accountUpdate, processAccountUpdate } from '@workers/accounts';
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
            break;
          case workerType.blockSave:
            processSaveBlock();
            break;
          case workerType.deployQuery:
            processDeployQuery();
            break;
          case workerType.eraSummaryandPerfomanceCalculation:
            processEraSummaryQuery();
            processValidatorUpdate();
            break;
          case workerType.accountUpdate:
            processAccountUpdate();
            break;
          default:
            indexer.start();
            break;
        }
      } else {
        console.log(
          `Block Query: ${await blockQuery.getActiveCount()} Active ${await blockQuery.getCompletedCount()} Complete ${await blockQuery.getFailedCount()} Failed`
        );

        console.log(
          `Block Save: ${await blockSave.getActiveCount()} Active ${await blockSave.getCompletedCount()} Complete ${await blockQuery.getFailedCount()} Failed`
        );
        console.log(
          `Deploy Query and save: ${await queryAndSaveDeploy.getActiveCount()} Active ${await queryAndSaveDeploy.getCompletedCount()} Complete ${await queryAndSaveDeploy.getFailedCount()} Failed`
        );
        console.log(
          `Era Summary: ${await queryEraSummary.getActiveCount()} Active ${await queryEraSummary.getCompletedCount()} Complete ${await queryEraSummary.getFailedCount()} Failed`
        );
        console.log(
          `Validator update: ${await validatorUpdate.getActiveCount()} Active ${await validatorUpdate.getCompletedCount()} Complete ${await validatorUpdate.getFailedCount()} Failed`
        );
        console.log(
          `Account update: ${await accountUpdate.getActiveCount()} Active ${await accountUpdate.getCompletedCount()} Complete ${await accountUpdate.getFailedCount()} Failed`
        );

        // eventStream.connect();
        // processBlockQuery();
        // processSaveBlock();
        // processDeployQuery();
        // processEraSummaryQuery();
        // processValidatorUpdate();
        // processAccountUpdate();
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
