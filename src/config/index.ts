import express, { Application } from 'express';
import { BlockIndexer } from 'indexer';
import mongoose from 'mongoose';
import { router } from '@v1-routes';
import { EventStreamHandler } from '@eventstream';
import { CasperServiceByJsonRPC } from 'casper-js-sdk';
import { logger } from 'logger';

export const Init = async () => {
  return await mongoose
    .connect(process.env.MONGO_URI as string)
    .then(async () => {
      if (process.env.INDEXER) {
        // const caspService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
        // await caspService
        //   .getEraInfoBySwitchBlock(
        //     'c5b88aa35305e5a8877a5f5fafe2f9aeede8c168cbf22009c5e7d6b679b45ed9'
        //   )
        //   .then((eraSummary) => {
        //     // console.log(JSON.stringify(eraSummary, null, 2));
        //     logger.info(eraSummary);
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
