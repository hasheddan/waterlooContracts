/// <reference types="bignumber.js" />
import { Order, SignedOrder } from '../types';
import * as BigNumber from 'bignumber.js';
import BN = require('bn.js');
export declare const utils: {
    bigNumberToBN(value: BigNumber.BigNumber): BN;
    consoleLog(message: string): void;
    isParityNode(nodeVersion: string): boolean;
    isTestRpc(nodeVersion: string): boolean;
    spawnSwitchErr(name: string, value: any): Error;
    getOrderHashHex(order: Order | SignedOrder): string;
    getCurrentUnixTimestamp(): BigNumber.BigNumber;
};
