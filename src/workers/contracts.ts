import Bull from 'bull';

export const queryContract = new Bull('contract-query', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

export const addQueryContract = async (contractHash: string) => {
  await queryContract.add(contractHash, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};

export const processQueryContract = async () => {
  queryContract.process(100, (job, done) => {
    try {
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};
