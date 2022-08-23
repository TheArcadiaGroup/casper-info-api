import { EventName, EventStream, JsonBlock } from 'casper-js-sdk';
import { setBlock } from '../controllers/block';

export class EventStreamHandler {
  constructor() {}

  connect() {
    const eventStream = new EventStream('http://16.162.124.124:9999/events/main');
    eventStream.start();

    eventStream.subscribe(EventName.BlockAdded, (result) => {
      const block = result.body.BlockAdded.block;
      // console.log(block);

      setBlock(block);
    });
  }
}
