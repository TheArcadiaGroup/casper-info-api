import { EventName, EventStream, GetBlockResult, GetDeployResult } from 'casper-js-sdk';
import { setBlock } from '@controllers/block';
import { casperService } from 'utils';

class EventStreamHandler {
  constructor() {}

  async connect() {
    const latestBlock: GetBlockResult = await casperService.getLatestBlockInfo();
    const currentHeight: number = latestBlock && (latestBlock.block?.header.height as number);
    const eventStream = new EventStream(process.env.EVENT_STREAM_URL as string);
    eventStream.start();
    eventStream.subscribe(EventName.BlockAdded, async (result) => {
      const block = result.body.BlockAdded.block;
      if (currentHeight > 0 && block.header.height >= currentHeight) {
        await setBlock(block);
        block.body?.deploy_hashes?.forEach(async (hash: string) => {
          await casperService.getDeployInfo(hash).then((deployResult: GetDeployResult) => {
            // setDeploy(deployResult);
          });
        });
      }
    });
  }
}

export const eventStream = new EventStreamHandler();
