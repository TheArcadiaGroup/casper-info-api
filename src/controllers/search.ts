import { Request, Response } from 'express';
import { processPublicKeyAndAccountHash } from '@controllers/account';
import { getBlockByPublicKeyFromDB } from '@controllers/block';
import { getDeployByPublicKey } from '@controllers/deploy';
import { getBidByPublicKeyFromDB } from '@controllers/validator';

export const searchAddress = async (req: Request, res: Response) => {
  const { address } = req.params;

  /**
   * If address is validator public key
   */
  const validator = await getBidByPublicKeyFromDB(address);
  if (validator) {
    return res.redirect(`${process.env.CLIENT_URL}/validators/${address}`);
  }

  /**
   * If address is account public key
   */
  const { publicKey, accountHash } = await processPublicKeyAndAccountHash(address);
  if (publicKey) {
    return res.redirect(`${process.env.CLIENT_URL}/accounts/${address}`);
  }

  /**
   * If address is account hash
  */
  if (publicKey === null && accountHash) {
    return res.redirect(`${process.env.CLIENT_URL}/accounts/${address}`);
  }

  /**
   * If address is block hash
   */
  const block = await getBlockByPublicKeyFromDB(address);
  if (block) {
    return res.redirect(`${process.env.CLIENT_URL}/blocks/${address}`);
  }

  /**
   * If address is deploy hash
   */
  const deploy = await getDeployByPublicKey(address);
  if (deploy) {
    return res.redirect(`${process.env.CLIENT_URL}/transactions/${address}`);
  } else {
    res.status(404).json({
      title: `Nothing was found...`,
      status: 404
    });
  }
};
