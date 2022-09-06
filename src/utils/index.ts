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

export const getLatestState = async (): Promise<GetStatusResult | void> => {
  return await casperService.getStatus().catch((err) => {
    // TODO handle error
    console.log(err);
    throw new Error(err);
  });
};
