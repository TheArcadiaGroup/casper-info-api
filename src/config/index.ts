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
        // const deployResult = await casperService.getDeployInfo(
        //   '5f0c925644bc2fc85ad7e6759951bdc31887c170405a9e86a6879e6d528afd80'
        // );
        // const amount = getAmount(deployResult.deploy.session);
        // console.log(amount);
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
