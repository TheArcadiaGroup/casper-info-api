import { setBlock } from '@controllers/block';
import Bull from 'bull';
import { QueryAndSaveDeploys } from 'workers/deploys';
import { CalculateValidatorPerformance, QueryEraSummary } from './era';
class QueueWorker {
  queueWorker: Bull.Queue;
  constructor() {
    this.queueWorker = new Bull('queue-manager', {
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
      }
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
    this.queueWorker.process('validator-perfomance-calculation', async (job: any) => {
      await CalculateValidatorPerformance(job.data);
    });
  }
  addBlockToQueue = async (block: any) => {
    await this.queueWorker.add('save-block', block);
  };

  addDeployHashes = async (hashes: string[], hashType: 'deploy' | 'transfer') => {
    await this.queueWorker.add('query-and-save-deploys', { hashes, hashType });
  };

  addEraSwitchBlockHeight = async (switchBlockHash: string) => {
    await this.queueWorker.add('era-summary', switchBlockHash);
  };
  addValidatorPerformanceCalculation = async (eraId: number) => {
    await this.queueWorker.add('validator-perfomance-calculation', eraId);
  };
}

export const queueWorker = new QueueWorker();
