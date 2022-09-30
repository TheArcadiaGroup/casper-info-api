import { Request, Response } from "express";
import { processPublicKeyAndAccountHash } from "./account";
import { getBlockByPublicKeyFromDB } from "./block";
import { getDeployByPublicKey } from "./deploy";
import { getValidatorByPublicKeyFromDB } from "./validator";


export const searchAddress = async ( req: Request, res: Response) => {
  const { address } = req.params

  /**
  * If address is validator public key
  */
   const validator = await getValidatorByPublicKeyFromDB(address)
   if (validator) {
     res.redirect(`/validators/${address}`);
   }

  /**
  * If address is account public key
  */
  const { publicKey } = await processPublicKeyAndAccountHash(address);
  if (publicKey) {
    res.redirect(`/accounts/${address}`);
  }

  /**
  * If address is block hash
  */
  const block = await getBlockByPublicKeyFromDB(address);
  if (block) {
    res.redirect(`/blocks/${address}`);
  }

  /**
  * If address is deploy hash
  */
  const deploy = await getDeployByPublicKey(address);
  if (deploy) {
    res.redirect(`/deploys/${address}`);
  } else {
    res.status(404).json({ 
      title: `Nothing was found...`,
      status: 404
    });
  }
}