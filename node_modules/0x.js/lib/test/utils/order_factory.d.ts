/// <reference types="bignumber.js" />
import * as BigNumber from 'bignumber.js';
import { ZeroEx, SignedOrder } from '../../src';
export declare const orderFactory: {
    createSignedOrderAsync(zeroEx: ZeroEx, maker: string, taker: string, makerFee: BigNumber.BigNumber, takerFee: BigNumber.BigNumber, makerTokenAmount: BigNumber.BigNumber, makerTokenAddress: string, takerTokenAmount: BigNumber.BigNumber, takerTokenAddress: string, exchangeContractAddress: string, feeRecipient: string, expirationUnixTimestampSec?: BigNumber.BigNumber | undefined): Promise<SignedOrder>;
};
