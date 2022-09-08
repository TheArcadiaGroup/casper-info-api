import { setBlock } from '@controllers/block';
import Bull from 'bull';
import { QueryAndSaveDeploys } from 'workers/deploys';
import { QueryBlock } from 'workers/blocks';
import { CalculateValidatorPerformance, QueryEraSummary } from 'workers/era';
import { updateAccount } from '@controllers/account';
class QueueWorker {
  queueWorker: Bull.Queue;
  constructor() {
    this.queueWorker = new Bull('queue-manager', {
      redis: {
        host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
      },
      defaultJobOptions: {
        attempts: 5,
        removeOnComplete: true,
        removeOnFail: 1000
      }
    });
    this.queueWorker.process('query-block', async (job) => {
      try {
        await QueryBlock(job.data);
        job.moveToCompleted();
      } catch (error) {
        job.moveToCompleted();
      }
    });
    this.queueWorker.process('save-block', async (job) => {
      try {
        await setBlock(job.data);
        job.moveToCompleted();
      } catch (error) {
        job.moveToCompleted();
      }
    });
    this.queueWorker.process('query-and-save-deploys', async (job) => {
      try {
        await QueryAndSaveDeploys(job.data);
        job.moveToCompleted();
      } catch (error) {
        job.moveToCompleted();
      }
    });
    this.queueWorker.process('era-summary', async (job) => {
      try {
        await QueryEraSummary(job.data.switchBlockHash, job.data.timestamp);
        job.moveToCompleted();
      } catch (error) {
        job.moveToCompleted();
      }
    });
    this.queueWorker.process('validator-performance-calculation', async (job) => {
      try {
        await CalculateValidatorPerformance(job.data);
        job.moveToCompleted();
      } catch (error) {
        job.moveToCompleted();
      }
    });

    this.queueWorker.process('account-update', async (job) => {
      try {
        await updateAccount(job.data.publicKey, job.data.activeDate);
        job.moveToCompleted();
      } catch (error) {
        job.moveToCompleted();
      }
    });
  }

  addBlockToQueryQueue = async (blockHeight: number) => {
    await this.queueWorker.add('query-block', blockHeight);
  };

  addBlockToSaveQueue = async (block: any) => {
    await this.queueWorker.add('save-block', block);
  };

  addDeployHashes = async (hashes: string[], hashType: 'deploy' | 'transfer') => {
    await this.queueWorker.add('query-and-save-deploys', { hashes, hashType });
  };

  addEraSwitchBlockHeight = async (switchBlockHash: string, timestamp: Date) => {
    await this.queueWorker.add('era-summary', { switchBlockHash, timestamp });
  };
  addValidatorPerformanceCalculation = async (eraId: number) => {
    await this.queueWorker.add('validator-performance-calculation', eraId);
  };
  addAccountUpdate = async (publicKey: string, activeDate: Date) => {
    await this.queueWorker.add('account-update', { publicKey, activeDate });
  };
}

export const queueWorker = new QueueWorker();
