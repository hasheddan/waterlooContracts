/// <reference types="bignumber.js" />
import * as BigNumber from 'bignumber.js';
import { ZeroEx, Token, SignedOrder } from '../../src';
export declare class FillScenarios {
    private zeroEx;
    private userAddresses;
    private tokens;
    private coinbase;
    private zrxTokenAddress;
    private exchangeContractAddress;
    constructor(zeroEx: ZeroEx, userAddresses: string[], tokens: Token[], zrxTokenAddress: string, exchangeContractAddress: string);
    createFillableSignedOrderAsync(makerTokenAddress: string, takerTokenAddress: string, makerAddress: string, takerAddress: string, fillableAmount: BigNumber.BigNumber, expirationUnixTimestampSec?: BigNumber.BigNumber): Promise<SignedOrder>;
    createFillableSignedOrderWithFeesAsync(makerTokenAddress: string, takerTokenAddress: string, makerFee: BigNumber.BigNumber, takerFee: BigNumber.BigNumber, makerAddress: string, takerAddress: string, fillableAmount: BigNumber.BigNumber, feeRecepient: string, expirationUnixTimestampSec?: BigNumber.BigNumber): Promise<SignedOrder>;
    createAsymmetricFillableSignedOrderAsync(makerTokenAddress: string, takerTokenAddress: string, makerAddress: string, takerAddress: string, makerFillableAmount: BigNumber.BigNumber, takerFillableAmount: BigNumber.BigNumber, expirationUnixTimestampSec?: BigNumber.BigNumber): Promise<SignedOrder>;
    createPartiallyFilledSignedOrderAsync(makerTokenAddress: string, takerTokenAddress: string, takerAddress: string, fillableAmount: BigNumber.BigNumber, partialFillAmount: BigNumber.BigNumber): Promise<SignedOrder>;
    private createAsymmetricFillableSignedOrderWithFeesAsync(makerTokenAddress, takerTokenAddress, makerFee, takerFee, makerAddress, takerAddress, makerFillableAmount, takerFillableAmount, feeRecepient, expirationUnixTimestampSec?);
    private increaseBalanceAndAllowanceAsync(tokenAddress, address, amount);
    private increaseBalanceAsync(tokenAddress, address, amount);
    private increaseAllowanceAsync(tokenAddress, address, amount);
}
