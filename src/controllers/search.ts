import { Request, Response } from 'express';
import { processPublicKeyAndAccountHash } from '@controllers/account';
import { getBlockByHashFromDB } from '@controllers/block';
import { getDeployByPublicKey } from '@controllers/deploy';
import { getBidByPublicKeyFromDB } from '@controllers/validator';
const clientUrl =
  process.env.NODE_ENV === 'dev' ? 'http://localhost:5173' : (process.env.CLIENT_URL as string);
export const searchAddress = async (req: Request, res: Response) => {
  const { address } = req.params;
  console.log(clientUrl);
  /**
   * If address is validator public key
   */
  const validator = await getBidByPublicKeyFromDB(address);
  if (validator) {
    return res.status(200).json({ endpoint: `/validators/${address}` });
  }

  /**
   * If address is account public key
   */
  const { publicKey } = await processPublicKeyAndAccountHash(address);
  if (publicKey) {
    return res.status(200).json({ endpoint: `/accounts/${address}` });
  }

  /**
   * If address is block hash
   */
  const block = await getBlockByHashFromDB(address);
  if (block) {
    return res.status(200).json({ endpoint: `/blocks/${address}` });
  }

  /**
   * If address is deploy hash
   */
  const deploy = await getDeployByPublicKey(address);
  if (deploy) {
    return res.status(200).json({ endpoint: `/transactions/${address}` });
  } else {
    return res.status(404).json({
      title: `Nothing was found...`,
      status: 404
    });
  }
};
