import { updateAccount } from '@controllers/account';
import Bull from 'bull';

export const accountUpdate = new Bull('account-update', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

export const addAccountUpdate = async (publicKey: string, activeDate: Date) => {
  await accountUpdate.add(
    { publicKey, activeDate },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processAccountUpdate = () => {
  accountUpdate.process(100, async (job, done) => {
    try {
      updateAccount(job.data.publicKey, job.data.activeDate);
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};
