import { CasperServiceByJsonRPC, ValidatorsInfoResult } from 'casper-js-sdk';
import express, { Application } from 'express';
import { BlockIndexer } from 'indexer';
import mongoose from 'mongoose';
import { router } from '../api/v1/routes';
import { EventStreamHandler } from '../eventstream';

export const Init = async () => {
  return await mongoose
    .connect(process.env.MONGO_URI as string)
    .then(async () => {
      if (process.env.INDEXER) {
        // const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
        // await casperService
        //   .getValidatorsInfo()
        //   .then((validatorsInfoResult: ValidatorsInfoResult) => {
        //     const { bids } = validatorsInfoResult.auction_state;
        //     const validator = bids.find(
        //       (bid) =>
        //         bid.public_key ==
        //         '0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca'
        //     );
        //     console.log(JSON.stringify(validator, null, 2));
        //   });
        const indexer = new BlockIndexer();
        indexer.start();
      } else {
        const eventStream = new EventStreamHandler();
        eventStream.connect();
      }
      const app: Application = express();
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(router);
      app.listen(process.env.PORT, () => console.log(`Server running at ${process.env.PORT}`));
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};
