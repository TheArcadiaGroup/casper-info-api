import { setBlock } from '@controllers/block';
import Bull from 'bull';
import { QueryAndSaveDeploys } from 'workers/deploys';
import { QueryEraSummary } from './era';
export class QueueWorker {
  queueWorker: Bull.Queue;
  constructor() {
    this.queueWorker = new Bull('queue-manager', {
      redis: {
        host: '127.0.0.1',
        port: 6379
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
  }
  addBlockToQueue = async (block: any) => {
    await this.queueWorker.add('save-block', block);
  };

  addDeployHashes = async (hashes: string[], hashType: 'deploy' | 'transfer') => {
    await this.queueWorker.add('query-and-save-deploys', { hashes, hashType });
  };

  addEraSwitchBlockHeight = async (switchBlockHeight: number) => {
    await this.queueWorker.add('era-summary', switchBlockHeight);
  };
}
