import * as Web3 from 'web3';
export declare class Contract implements Web3.ContractInstance {
    address: string;
    abi: Web3.ContractAbi;
    private contract;
    private defaults;
    private validator;
    [name: string]: any;
    constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<Web3.TxData>);
    private populateFunctions();
    private populateEvents();
    private promisifyWithDefaultParams(fn);
    private isTxData(lastArg);
}
