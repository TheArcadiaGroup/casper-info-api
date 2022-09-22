import { updateAccount } from '@controllers/account';
import Bull from 'bull';

const accountUpdate = new Bull('account-update', {
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
  accountUpdate.process(20, async (job, done) => {
    updateAccount(job.data.publicKey, job.data.activeDate)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
