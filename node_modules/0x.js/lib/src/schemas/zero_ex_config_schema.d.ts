export declare const zeroExConfigSchema: {
    id: string;
    properties: {
        gasPrice: {
            $ref: string;
        };
        exchangeContractAddress: {
            $ref: string;
        };
        tokenRegistryContractAddress: {
            $ref: string;
        };
        etherTokenContractAddress: {
            $ref: string;
        };
    };
    type: string;
};
