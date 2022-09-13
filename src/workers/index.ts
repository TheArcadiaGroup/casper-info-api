import { setBlock } from '@controllers/block';
import Bull from 'bull';
import { QueryAndSaveDeploys } from '@workers/deploys';
import { QueryBlock } from '@workers/blocks';
import { CalculateValidatorPerformance, QueryEraSummary } from '@workers/era';
import { updateAccount } from '@controllers/account';
export class QueueWorker {
  queueWorker: Bull.Queue;
  constructor() {
    this.queueWorker = new Bull('queue-worker', {
      redis: {
        host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
      }
      // defaultJobOptions: {
      //   attempts: 10,
      //   removeOnComplete: true,
      //   removeOnFail: 1000
      // }
    });
  }
  addBlockToQueryQueue = async (blockHeight: number) => {
    await this.queueWorker
      .add('query-block', blockHeight, {
        attempts: 10,
        removeOnComplete: true,
        removeOnFail: 1000
      })
      .then((job) => {
        console.log(job.data);
      });
  };
  processBlockQuery = async () => {
    this.queueWorker.process('query-block', 20, async (job, done) => {
      // console.log(`Block to Query: ${job.data} >> ${job.id}`);
      QueryBlock(job.data)
        .then(() => {
          done();
        })
        .catch((err) => done(new Error(err)));
    });
  };
  addBlockToSaveQueue = async (block: any) => {
    await this.queueWorker.add('save-block', block, {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    });
  };
  processSaveBlock = async () => {
    this.queueWorker.process('save-block', 20, async (job, done) => {
      console.log(`Block to save: ${job.data.header.height}`);
      setBlock(job.data)
        .then(() => {
          done();
        })
        .catch((err) => done(new Error(err)));
    });
  };
  addDeployHashes = async (hashes: string[], hashType: 'deploy' | 'transfer') => {
    await this.queueWorker.add(
      'query-and-save-deploys',
      { hashes, hashType },
      {
        attempts: 10,
        removeOnComplete: true,
        removeOnFail: 1000
      }
    );
  };
  processDeployQuery = async () => {
    this.queueWorker.process('query-and-save-deploys', 20, async (job, done) => {
      QueryAndSaveDeploys(job.data)
        .then(() => {
          done();
        })
        .catch((err) => done(new Error(err)));
    });
  };
  addEraSwitchBlockHeight = async (switchBlockHash: string, timestamp: Date) => {
    await this.queueWorker.add(
      'era-summary',
      { switchBlockHash, timestamp },
      {
        attempts: 10,
        removeOnComplete: true,
        removeOnFail: 1000
      }
    );
  };
  processEraSummaryQuery = () => {
    this.queueWorker.process('era-summary', 20, async (job, done) => {
      QueryEraSummary(job.data.switchBlockHash, job.data.timestamp)
        .then(() => {
          done();
        })
        .catch((err) => done(new Error(err)));
    });
  };
  addValidatorPerformanceCalculation = async (eraId: number) => {
    await this.queueWorker.add('validator-performance-calculation', eraId, {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    });
  };
  processValidatorPerformanceCalculation = async () => {
    this.queueWorker.process('validator-performance-calculation', 20, async (job, done) => {
      CalculateValidatorPerformance(job.data)
        .then(() => {
          done();
        })
        .catch((err) => done(new Error(err)));
    });
  };
  addAccountUpdate = async (publicKey: string, activeDate: Date) => {
    await this.queueWorker.add(
      'account-update',
      { publicKey, activeDate },
      {
        attempts: 10,
        removeOnComplete: true,
        removeOnFail: 1000
      }
    );
  };
  processAccountUpdate = () => {
    this.queueWorker.process('account-update', 20, async (job, done) => {
      updateAccount(job.data.publicKey, job.data.activeDate)
        .then(() => {
          done();
        })
        .catch((err) => done(new Error(err)));
    });
  };
}
export const queueWorker = new QueueWorker();
