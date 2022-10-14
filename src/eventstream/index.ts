import { EventName, EventStream, GetBlockResult } from 'casper-js-sdk';
import { casperService, getLatestState } from '@utils';
import { addBlockToQueryQueue, addBlockToSaveQueue } from '@workers/blocks';
import { addDeployHashes } from '@workers/deploys';
import { addEraSwitchBlockHash } from '@workers/era';
import { getBlockByHeightFromDB } from '@controllers/block';

class EventStreamHandler {
  constructor() {
    this.match();
  }
  async match() {
    const chainState = await getLatestState();
    const latestBlockHeight = chainState.last_added_block_info.height;
    for (let i = latestBlockHeight - 100; i <= latestBlockHeight; i++) {
      const block = await getBlockByHeightFromDB(i);
      if (!block) addBlockToQueryQueue(i);
    }
  }
  async connect() {
    const latestBlock: GetBlockResult = await casperService.getLatestBlockInfo();
    const currentHeight: number = latestBlock && (latestBlock.block?.header.height as number);
    const eventStream = new EventStream(process.env.EVENT_STREAM_URL as string);
    eventStream.start();
    eventStream.subscribe(EventName.BlockAdded, async (result) => {
      const block = result.body.BlockAdded.block;
      if (currentHeight > 0 && block.header.height >= currentHeight) {
        addBlockToSaveQueue(block);
        block?.body?.deploy_hashes?.forEach((hash) => {
          addDeployHashes(hash, 'deploy');
        });
        block?.body?.transfer_hashes?.forEach((hash) => {
          addDeployHashes(hash, 'transfer');
        });
        if (block.header.era_end) {
          addEraSwitchBlockHash(block.hash, block.header.timestamp);
        }
      }
    });
  }
}

export const eventStream = new EventStreamHandler();
