import { getLatestState } from '@utils';
import { Request, Response } from 'express';
export const getChainState = async (req: Request, res: Response) => {
  try {
    const chainState = await getLatestState();
    res.status(200).json(chainState);
  } catch (error) {
    res.status(500).send(`Could not fetch latest chain state: ${error}`);
  }
};
