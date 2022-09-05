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
      }
    });
    this.queueWorker.process('query-block', async (job: any) => {
      await QueryBlock(job.data);
    });
    this.queueWorker.process('save-block', async (job: any) => {
      await setBlock(job.data);
    });
    this.queueWorker.process('query-and-save-deploys', async (job: any) => {
      await QueryAndSaveDeploys(job.data);
    });
    this.queueWorker.process('era-summary', async (job: any) => {
      await QueryEraSummary(job.data);
    });
    this.queueWorker.process('validator-performance-calculation', async (job: any) => {
      await CalculateValidatorPerformance(job.data);
    });

    this.queueWorker.process('account-update', async (job: any) => {
      await updateAccount(job.data.publicKey, job.data.activeDate);
    });
  }

  addBlockToQueryQueue = async (blockHeight: number) => {
    await this.queueWorker.add('query-block', blockHeight);
  };

  addBlockToSaveQueue = async (block: any) => {
    await this.queueWorker.add('save-block', block);
    console.log('Block added', block.header.height);
  };

  addDeployHashes = async (hashes: string[], hashType: 'deploy' | 'transfer') => {
    await this.queueWorker.add('query-and-save-deploys', { hashes, hashType });
  };

  addEraSwitchBlockHeight = async (switchBlockHash: string) => {
    await this.queueWorker.add('era-summary', switchBlockHash);
  };
  addValidatorPerformanceCalculation = async (eraId: number) => {
    await this.queueWorker.add('validator-performance-calculation', eraId);
  };
  addAccountUpdate = async (publicKey: string, activeDate: Date) => {
    await this.queueWorker.add('account-update', { publicKey, activeDate });
  };
}

export const queueWorker = new QueueWorker();
