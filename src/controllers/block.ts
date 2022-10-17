import { Request, Response } from 'express';
import { Block } from '@models/blocks';
import { logger } from '@logger';
import { getDeploysByBlockHash } from './deploy';
import { casperService, checkBlockID, getLatestState } from '@utils';
export const getBlocks = (req: Request, res: Response) => {
  const { startIndex, count } = req.query;
  Block.find()
    .sort({ blockHeight: 'desc' })
    .where('blockHeight')
    .gt(Number(startIndex) - Number(count))
    .lte(Number(startIndex))
    .then((blocks) => {
      res.status(200).json(blocks);
    })
    .catch((err) => {
      res.status(500);
    });
};
export const getLatestBlocks = (req: Request, res: Response) => {
  const { count } = req.params;
  Block.find()
    .sort({ blockHeight: 'desc' })
    .limit(Number(count))
    .then((blocks) => {
      res.status(200).json(blocks);
    })
    .catch((err) => {
      res.status(500);
    });
};
export const getBlockByHeightFromDB = async (blockHeight: number) => {
  try {
    return await Block.findOne({ blockHeight });
  } catch (error) {
    console.log(error);
  }
};
export const getBlockByHashFromDB = async (blockHash: string) => {
  try {
    return await Block.findOne({ blockHash });
  } catch (error) {
    console.log(error);
  }
};
export const getBlockFromChain = async (address: string) => {
  try {
    const chainStatus = await getLatestState();
    const currentHeight = chainStatus.last_added_block_info.height;
    const addressType = checkBlockID(address, currentHeight);
    let getBlockResult;
    if (addressType === 'hash') {
      getBlockResult = await casperService.getBlockInfo(address).catch((err) => {
        console.log('Could not get block by hash: ', err);
      });
    } else if (addressType === 'height') {
      getBlockResult = await casperService.getBlockInfoByHeight(parseInt(address)).catch((err) => {
        console.log('Could not get block by height: ', err);
      });
    }
    const block = getBlockResult?.block ?? null;
    let _block;
    _block = {
      height: block.header.height,
      eraID: block.header.era_id,
      transactions: block.body.deploy_hashes.length,
      timestamp: Date.parse(block.header.timestamp.toString()),
      hash: block.hash,
      validatorPublicKey: block.body.proposer,
      stateRootHash: block.header.state_root_hash,
      proofs: block.proofs
    };
    return _block;
  } catch (error) {
    throw new Error(`Could not fetch block from chain: ${error}`);
  }
};
export const getBlockByHashOrHeight = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const block = await getBlockFromChain(address);
    res.status(200).json(block);
  } catch (error) {
    res.status(500).send(`Could not fetch block ${error}`);
  }
};

export const getSwitchBlocks = async () => {
  try {
    return await Block.find({ isSwitchBlock: true }).sort({ blockHeight: 'desc' });
  } catch (error) {
    // TODO handle error
    throw new Error(`Could fetch switch blocks ${error}`);
  }
};
export const getSwitchBlockByEraId = async (eraID: number) => {
  try {
    return await Block.findOne({ isSwitchBlock: true, eraID });
  } catch (error) {
    // TODO handle error
    throw new Error(`Could fetch switch blocks ${error}`);
  }
};
export const getBlockByHash = async (req: Request, res: Response) => {
  try {
    const { blockHash } = req.params;
    const block = await getBlockByHashFromDB(blockHash);
    res.status(200).json(block);
  } catch (error) {
    res.status(500).send(`Could not fetch block ${error}`);
  }
};
export const getBlocksByValidatorPublicKeyFromDB = async (
  validatorPublicKey: string,
  startIndex: number,
  count: number
) => {
  try {
    return await Block.find({ validatorPublicKey })
      .sort({ blockHeight: 'desc' })
      .skip(startIndex - 1)
      .limit(count);
  } catch (error) {
    console.log(error);
  }
};
export const getBlockByValidatorPublicKey = async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;
    const { startIndex, count } = req.query;
    const blocks = await getBlocksByValidatorPublicKeyFromDB(
      publicKey,
      Number(startIndex),
      Number(count)
    );
    res.status(200).json(blocks);
  } catch (error) {
    res.status(500).send(`Could not fetch block transfers ${error}`);
  }
};
export const getBlockTransfers = async (req: Request, res: Response) => {
  try {
    const { blockHash } = req.params;
    let transfers = await getDeploysByBlockHash(blockHash);
    transfers = transfers.filter((transfer) => transfer.entryPoint === 'transfer');
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).send(`Could not fetch block transfers ${error}`);
  }
};

export const setBlock = async (block: any) => {
  await Block.findOneAndUpdate(
    { blockHeight: block.header.height },
    {
      blockHeight: block.header.height,
      blockHash: block.hash,
      eraID: block.header.era_id,
      transfers: block.body?.transfer_hashes?.length || 0,
      deploys: block.body?.deploy_hashes?.length || 0,
      timestamp: block.header.timestamp,
      isSwitchBlock: block.header.era_end ? true : false,
      validatorPublicKey: block.body.proposer
    },
    { new: true, upsert: true }
  )
    .then((block) =>
      console.log(`New block: ${Date.now()} --> ${block.blockHeight}: ${block.deploys}`)
    )
    .catch((err) => {
      logger.error({
        blockDB: {
          blockHash: block.header.height,
          errMessage: `${err}`,
          rawData: block
        }
      });
    });
};
