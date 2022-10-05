import { CasperClient, CasperServiceByJsonRPC, GetStatusResult } from 'casper-js-sdk';
import CoinGecko from 'coingecko-api';
export const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
export const casperClient = new CasperClient(process.env.RPC_URL as string);
export const coinGeckoClient = new CoinGecko();
export const getCurrentEra = async (): Promise<number | void> => {
  return await casperService
    .getLatestBlockInfo()
    .then((blockResult) => {
      return blockResult.block.header.era_id;
    })
    .catch((err) => {
      // TODO handle error
      console.log(err);
    });
};

export const getBlockEra = async (blockHash: string): Promise<number | void> => {
  return await casperService
    .getBlockInfo(blockHash)
    .then((blockResult) => {
      return blockResult.block.header.era_id as number;
    })
    .catch((err) => {
      // TODO handle error
      console.log(err);
    });
};

export const getLatestState = async (): Promise<GetStatusResult> => {
  try {
    return await casperService.getStatus()  
  } catch (error) {
    throw new Error(error);
  }
};

export const getRedisConnectionDetails = () => {
  let redis: {
    host: string;
    port: number;
  };
  if (process.env.INDEXER == 'true') {
    redis.host;
  }
  return redis;
};

//  host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
//     port: Number(process.env.REDIS_PORT)
