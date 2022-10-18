import axios from 'axios';
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
  try {
    const blockResult = await casperService.getBlockInfo(blockHash);
    return blockResult.block.header.era_id as number;
  } catch (error) {
    console.log(error);
  }
};

export const getLatestState = async (): Promise<GetStatusResult> => {
  try {
    return await casperService.getStatus();
  } catch (error) {
    // TODO Handle error
    // throw new Error(error);
    console.log(error);
  }
};

export const checkBlockID = (id: any, currentHeight: number): 'hash' | 'height' | 'unknown' => {
  let idType: 'hash' | 'height' | 'unknown' = 'unknown';
  isNaN(id) && id.length == 64
    ? (idType = 'hash')
    : !isNaN(id) && parseInt(id) > 0 && parseInt(id) < currentHeight
    ? (idType = 'height')
    : 'unknown';
  return idType;
};

export const rpcRequest = async (method: string, params: any) => {
  try {
    const config = {
      url: process.env.RPC_URL,
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        jsonrpc: '2.0',
        id: 'id',
        method,
        params
      })
    };
    const res = await axios.request(config);
    return res.data.result && res.data.result;
  } catch (error) {
    // TODO handle error
    console.log(`RPC Error: ${error}`);
  }
};
