import { Request, Response } from 'express';
import { Block } from '@models/blocks';
import { logger } from '@logger';
import { getTransferByBlockHash } from './deploy';
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
export const getBlockByHash = async (req: Request, res: Response) => {
  try {
    const { blockHash } = req.params;
    const block = await getBlockByHashFromDB(blockHash);
    res.status(200).json(block);
  } catch (error) {
    res.status(500).send(`Could not fetch block transfers ${error}`);
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
  const { blockHash } = req.params;
  try {
    const transfers = await getTransferByBlockHash(blockHash);
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
  // TODO consider saving raw block data
  // await RawBlock.create({
  //   block
  // }).catch((err) => {
  //   logger.error({
  //     rawBlockDB: {
  //       blockHash: block.header.height,
  //       errMessage: `${err}`,
  //       rawData: block
  //     }
  //   });
  // });
};
