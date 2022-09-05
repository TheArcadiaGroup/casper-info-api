import { EventName, EventStream, GetBlockResult, GetDeployResult } from 'casper-js-sdk';
import { setBlock } from '@controllers/block';
import { queueWorker } from 'workers';
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
        console.log(block.header.height);
        queueWorker.addBlockToSaveQueue(block);
        queueWorker.addDeployHashes(block?.body?.deploy_hashes, 'deploy');
        queueWorker.addDeployHashes(block?.body?.transfer_hashes, 'transfer');
        if (block.header.era_end) {
          queueWorker.addEraSwitchBlockHeight(block.hash);
        }
      }
    });
  }
}

export const eventStream = new EventStreamHandler();
