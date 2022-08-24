import { JsonBlock } from 'casper-js-sdk';
import { Response } from 'express';
import Block from '../models/blocks';
export const getBlocks = async (res: Response) => {
  await Block.find()
    .then((blocks) => {
      res.status(200).json(blocks);
    })
    .catch((err) => console.log(err));
};

export const setBlock = async (block: JsonBlock) => {
  await Block.create({
    blockHash: block.hash
  })
    .then((block) => console.log(block))
    .catch((err) => {
      console.log(err);
    });
};
