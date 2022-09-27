import { EventName, EventStream, GetBlockResult } from 'casper-js-sdk';
import { casperService } from '@utils';
import { addBlockToSaveQueue } from '@workers/blocks';
import { addDeployHashes } from '@workers/deploys';
import { addEraSwitchBlockHash } from '@workers/era';

class EventStreamHandler {
  constructor() {}

  async connect() {
    const latestBlock: GetBlockResult = await casperService.getLatestBlockInfo();
    const currentHeight: number = latestBlock && (latestBlock.block?.header.height as number);
    const eventStream = new EventStream(process.env.EVENT_STREAM_URL as string);
    eventStream.start();
    eventStream.subscribe(EventName.BlockAdded, async (result) => {
      const block = result.body.BlockAdded.block;
      console.log(block.header.height);
      if (currentHeight > 0 && block.header.height >= currentHeight) {
        addBlockToSaveQueue(block);
        block?.body?.deploy_hashes?.length > 0 &&
          addDeployHashes(block?.body?.deploy_hashes, 'deploy');
        block?.body?.transfer_hashes?.length > 0 &&
          addDeployHashes(block?.body?.transfer_hashes, 'transfer');
        if (block.header.era_end) {
          addEraSwitchBlockHash(block.hash, block.header.timestamp);
        }
      }
    });
  }
}

export const eventStream = new EventStreamHandler();
