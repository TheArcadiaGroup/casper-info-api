"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStreamHandler = void 0;
const casper_js_sdk_1 = require("casper-js-sdk");
class EventStreamHandler {
    constructor() { }
    connect() {
        const eventStream = new casper_js_sdk_1.EventStream('http://16.162.124.124:9999/events/main');
        eventStream.start();
        eventStream.subscribe(casper_js_sdk_1.EventName.BlockAdded, (result) => {
            //   console.log(result);
        });
    }
}
exports.EventStreamHandler = EventStreamHandler;
