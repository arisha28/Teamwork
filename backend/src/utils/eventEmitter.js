import { EventEmitter } from "events";
class AppEventEmitter extends EventEmitter {}
export const domainEvents = new AppEventEmitter();
