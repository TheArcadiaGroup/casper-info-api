import { setDeploy, setDeployHash, getLatestDeployHashPage } from '@controllers/deploy';
import { logger } from '@logger';
import Bull from 'bull';
import axios from 'axios';
import { addAccountUpdate } from './accounts';
import { casperService } from '@utils';
import { GetDeployResult } from 'casper-js-sdk';
import { addQueryContract } from './contracts';

let page = 1;
let pageSize = 10000;
let count = 0;
setImmediate(async () => {
  page = (await getLatestDeployHashPage()[0]?._id) || 0;
});
export const queryDeploy = new Bull('deploy-query', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const saveDeploy = new Bull('deploy-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const saveDeployHash = new Bull('deploy-hash-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addSaveDeployHash = async (deployHash: string, timestamp: Date, page: Number) => {
  await saveDeployHash.add(
    { deployHash, timestamp, page },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processSaveDeployHash = async () => {
  saveDeployHash.process(100, async (job, done) => {
    const { deployHash, timestamp, page } = job.data;
    setDeployHash(deployHash, timestamp, page)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
export const addDeployHashes = async (hash: string, hashType: 'deploy' | 'transfer') => {
  await queryDeploy.add(
    { hash, hashType },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processDeployQuery = async () => {
  queryDeploy.process(100, async (job, done) => {
    QueryDeploy(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
// Add deploy to deploy saving queue
export const addDeployToSave = async (deploy: GetDeployResult, hashType: string) => {
  await saveDeploy.add(
    { deploy, hashType },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processDeploySave = async () => {
  saveDeploy.process(500, async (job, done) => {
    try {
      const { deploy, hashType } = job.data;
      await setDeploy(deploy, hashType);
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};

export const QueryDeploy = async (data) => {
  const { hash, hashType } = data;
  try {
    const deployResult = await casperService.getDeployInfo(hash);
    const deployRes: any = deployResult;
    await addDeployToSave(deployRes, hashType);
    await addAccountUpdate(
      deployResult.deploy?.header?.account,
      new Date(deployResult.deploy.header.timestamp)
    );
    const validatorPublicKey = deployRes.deploy?.session?.StoredContractByHash?.args?.find(
      (value) => {
        return value[0] === 'validator';
      }
    )[1]?.parsed;
    if (validatorPublicKey) {
      await addAccountUpdate(validatorPublicKey, new Date(deployResult.deploy.header.timestamp));
    }
    const contractHash: string =
      deployRes.deploy?.session?.StoredContractByHash?.hash ||
      deployRes.deploy?.session?.StoredContractByName?.hash ||
      '';
    await addQueryContract(contractHash, new Date(deployResult.deploy.header.timestamp));
  } catch (error) {
    logger.error({ deployRPC: { deployHash: hash, errMessage: `${error}` } });
  }
};

export const matchDeploys = () => {
  setInterval(async () => {
    try {
      // console.log(`Page: ${page}`);
      const res = await axios.get(
        `https://event-store-api-clarity-mainnet.make.services/extended-deploys?page=${page}&limit=100`
        // `https://api.casperstats.io/chain/get-latest-txs?start=${page}&count=${pageSize}`
      );
      // console.log(res.data);
      // if (res?.data?.length > 0) {
      //   res.data?.forEach(async (deploy) => {
      //     // await addSaveDeployHash(deploy.deploy_hash, new Date(deploy.timestamp), page);
      //   });
      //   page += pageSize;
      //   count += res.data?.length;
      //   console.log(count, page);
      // }
      if (res?.data?.data?.length > 0) {
        res.data?.data?.forEach(async (deploy) => {
          await addSaveDeployHash(deploy.deploy_hash, new Date(deploy.timestamp), page);
        });
        page++;
        count += res.data?.data?.length;
        console.log(count, page);
      }
    } catch (error) {
      console.log(`Err: `);
    }
  }, 10000);
};
