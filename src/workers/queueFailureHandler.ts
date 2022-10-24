import { accountUpdate } from '@workers/accounts';
import { blockQuery, blockSave } from '@workers/blocks';
import { eraMatch, queryEraSummary } from '@workers/era';
import {
  bidDelegatorSave,
  bidOrValidatorSave,
  bidPerformanceAndRewardsUpdate,
  validatorsInfoFetch
} from '@workers/validators';
import { queryDeploy, saveDeploy, saveMatchedDeploy } from '@workers/deploys';
import { rewardSaving } from './rewards';
import { queryContract, saveContract } from './contracts';

export const failedBlockQueriesHandler = () => {
  setInterval(async () => {
    const failedBlockQueries = await blockQuery.getFailed();
    // console.log(JSON.stringify(failedBlockQueries, null, 2));
    failedBlockQueries &&
      failedBlockQueries.forEach(async (job) => {
        job && (await blockQuery.add(job.data, job.opts));
        job && job.remove();
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
        job && (await blockSave.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};

export const failedDeployQueriesHandler = () => {
  setInterval(async () => {
    const failedDeployQueries = await queryDeploy.getFailed();
    // console.log(JSON.stringify(failedDeployQueries[0], null, 2));
    failedDeployQueries &&
      failedDeployQueries.forEach(async (job) => {
        job && (await queryDeploy.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};

export const failedDeploySavesHandler = () => {
  setInterval(async () => {
    const failedDeploySaves = await saveDeploy.getFailed();
    failedDeploySaves &&
      failedDeploySaves.forEach(async (job) => {
        job && (await saveDeploy.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};
export const failedMatchedDeploySavesHandler = () => {
  setInterval(async () => {
    const failedMatchedDeploySaves = await saveMatchedDeploy.getFailed();
    failedMatchedDeploySaves &&
      failedMatchedDeploySaves.forEach(async (job) => {
        job && (await saveMatchedDeploy.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};
export const failedContractQueriesHandler = () => {
  setInterval(async () => {
    const failedContractQueries = await queryContract.getFailed();
    failedContractQueries &&
      failedContractQueries.forEach(async (job) => {
        if (!job.failedReason.includes('ValueNotFound')) {
          job && (await queryContract.add(job.data, job.opts));
        }
        job && job.remove();
      });
  }, 500);
};
export const failedContractSavesHandler = () => {
  setInterval(async () => {
    const failedContractSaves = await saveContract.getFailed();
    failedContractSaves &&
      failedContractSaves.forEach(async (job) => {
        job && (await saveContract.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};
export const failedEraSummaryQueriesHandler = () => {
  setInterval(async () => {
    const failedEraSummaryQueries = await queryEraSummary.getFailed();
    failedEraSummaryQueries &&
      failedEraSummaryQueries?.forEach(async (job) => {
        job && (await queryEraSummary.add(job?.data, job.opts));
        job && job.remove();
      });
  }, 500);
};

export const failedValidatorUpdatesHandler = () => {
  setInterval(async () => {
    const failedValidatorUpdates = await bidPerformanceAndRewardsUpdate.getFailed();
    failedValidatorUpdates &&
      failedValidatorUpdates.forEach(async (job) => {
        job && (await bidPerformanceAndRewardsUpdate.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};

export const failedAccountUpdatesHandler = () => {
  setInterval(async () => {
    const failedAccountUpdates = await accountUpdate.getFailed();
    failedAccountUpdates &&
      failedAccountUpdates.forEach(async (job) => {
        job && (await accountUpdate.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};

export const failedValidatorInforFetchHandler = () => {
  setInterval(async () => {
    const failedValidatorInfo = await validatorsInfoFetch.getFailed();
    failedValidatorInfo &&
      failedValidatorInfo.forEach(async (job) => {
        job && (await validatorsInfoFetch.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};
export const failedBidOrValidatorSaveHandler = () => {
  setInterval(async () => {
    const failedbidOrValidatorSave = await bidOrValidatorSave.getFailed();
    failedbidOrValidatorSave &&
      failedbidOrValidatorSave.forEach(async (job) => {
        job && (await bidOrValidatorSave.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};
export const failedBidDelegatorSaveHandler = () => {
  setInterval(async () => {
    const failedBidValidatorSave = await bidDelegatorSave.getFailed();
    failedBidValidatorSave &&
      failedBidValidatorSave.forEach(async (job) => {
        job && (await bidDelegatorSave.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};
export const failedEraMatchHandler = () => {
  setInterval(async () => {
    const failedEraMatch = await eraMatch.getFailed();
    failedEraMatch &&
      failedEraMatch.forEach(async (job) => {
        job && (await eraMatch.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};
export const failedRewardSaveHandler = () => {
  setInterval(async () => {
    const failedRewardSave = await rewardSaving.getFailed();
    failedRewardSave &&
      failedRewardSave.forEach(async (job) => {
        job && (await rewardSaving.add(job.data, job.opts));
        job && job.remove();
      });
  }, 500);
};
