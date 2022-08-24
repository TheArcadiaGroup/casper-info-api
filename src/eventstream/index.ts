import {
  CasperServiceByJsonRPC,
  EventName,
  EventStream,
  GetBlockResult,
  JsonBlock
} from 'casper-js-sdk';
import { setBlock } from '../controllers/block';

export class EventStreamHandler {
  constructor() {}

  async connect() {
    const casperService: CasperServiceByJsonRPC = new CasperServiceByJsonRPC(
      process.env.RPC_URL as string
    );
    const latestBlock: GetBlockResult = await casperService.getLatestBlockInfo();
    const currentHeight: number = latestBlock && (latestBlock.block?.header.height as number);
    const eventStream = new EventStream(process.env.EVENT_STREAM_URL as string);
    eventStream.start();

    eventStream.subscribe(EventName.BlockAdded, (result) => {
      const block = result.body.BlockAdded.block;
      // console.log(block);
      if (currentHeight > 0 && block.header.height >= currentHeight) setBlock(block);
    });
  }
}
