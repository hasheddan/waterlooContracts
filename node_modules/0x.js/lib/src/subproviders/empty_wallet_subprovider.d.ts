import { JSONRPCPayload } from '../types';
export declare class EmptyWalletSubProvider {
    handleRequest(payload: JSONRPCPayload, next: () => void, end: (err: Error | null, result: any) => void): void;
    setEngine(engine: any): void;
}
