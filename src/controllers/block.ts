import { Block } from '@models/blocks';
import { logger } from 'logger';
import { getTransferByBlockHash } from './deploy';
export const getBlocks = async (req: any, res: any) => {
  const startIndex: number = req.query.startIndex;
  const count: number = req.query.count;
  await Block.find()
    .sort({ blockHeight: 'desc' })
    .where('blockHeight')
    .gt(startIndex - count)
    .lte(startIndex)
    .then((blocks) => {
      res.status(200).json(blocks);
    })
    .catch((err) => {
      res.status(500);
    });
};
export const getBlockTransfers = async (req, res) => {
  const { blockHash } = req.params;
  try {
    const transfers = await getTransferByBlockHash(blockHash);
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).send(`Could not fetch block transfers ${error}`);
  }
};
export const setBlock = async (block: any) => {
  console.log(`Block to save: ${block.header.height}`);
  await Block.findOneAndUpdate(
    { blockHeight: block.header.height },
    {
      blockHeight: block.header.height,
      blockHash: block.hash,
      eraID: block.header.era_id,
      transfers: block.body?.transfer_hashes?.length || 0,
      deploys: block.body?.deploy_hashes?.length || 0,
      timestamp: block.header.timestamp,
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
