import { accountUpdate } from '@workers/accounts';
import { blockQuery, blockSave } from '@workers/blocks';
import { queryEraSummary } from '@workers/era';
import { bidPerformanceAndRewardsUpdate } from '@workers/validators';
import { queryAndSaveDeploy } from '@workers/deploys';

export const failedBlockQueriesHandler = () => {
  setInterval(async () => {
    const failedBlockQueries = await blockQuery.getFailed();
    // console.log(JSON.stringify(failedBlockQueries, null, 2));
    failedBlockQueries &&
      failedBlockQueries.forEach(async (job) => {
        await blockQuery.add(job.data, job.opts);
        job.remove();
      });
  }, 500);
};

export const failedBlockSavesHandler = () => {
  setInterval(async () => {
    const failedBlockSaves = await blockSave.getFailed();
    // console.log(JSON.stringify(failedBlockSaves[0], null, 2));
    failedBlockSaves &&
      failedBlockSaves?.forEach(async (job) => {
        if (!job.data.height) {
          job.remove();
          return;
        }
        await blockSave.add(job.data, job.opts);
        job.remove();
      });
  }, 500);
};

export const failedDeployQueriesHandler = () => {
  setInterval(async () => {
    const failedDeployQueries = await queryAndSaveDeploy.getFailed();
    // console.log(JSON.stringify(failedDeployQueries[0], null, 2));
    failedDeployQueries &&
      failedDeployQueries.forEach(async (job) => {
        await queryAndSaveDeploy.add(job.data, job.opts);
        job.remove();
      });
  }, 500);
};

export const failedEraSummaryQueriesHandler = () => {
  setInterval(async () => {
    const failedEraSummaryQueries = await queryEraSummary.getFailed();
    failedEraSummaryQueries &&
      failedEraSummaryQueries.forEach(async (job) => {
        await queryEraSummary.add(job.data, job.opts);
        job.remove();
      });
  }, 500);
};

export const failedValidatorUpdatesHandler = () => {
  setInterval(async () => {
    const failedValidatorUpdates = await bidPerformanceAndRewardsUpdate.getFailed();
    failedValidatorUpdates &&
      failedValidatorUpdates.forEach(async (job) => {
        await bidPerformanceAndRewardsUpdate.add(job.data, job.opts);
        job.remove();
      });
  }, 500);
};

export const failedAccountUpdatesHandler = () => {
  setInterval(async () => {
    const failedAccountUpdates = await accountUpdate.getFailed();
    failedAccountUpdates &&
      failedAccountUpdates.forEach(async (job) => {
        await accountUpdate.add(job.data, job.opts);
        job.remove();
      });
  }, 500);
};
