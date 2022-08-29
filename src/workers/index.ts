import { setBlock } from '@controllers/block';
import Bull from 'bull';
import { QueryAndSaveDeploys } from 'workers/deploys';
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
  }
  addBlockToQueue = async (block: any) => {
    const blockJob = await this.queueWorker.add('save-block', block);
  };

  addDeployHashes = async (hashes: string[]) => {
    await this.queueWorker.add('query-and-save-deploys', hashes);
  };
}
