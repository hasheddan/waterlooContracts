"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zeroExConfigSchema = {
    id: '/ZeroExConfig',
    properties: {
        gasPrice: { $ref: '/Number' },
        exchangeContractAddress: { $ref: '/Address' },
        tokenRegistryContractAddress: { $ref: '/Address' },
        etherTokenContractAddress: { $ref: '/Address' },
    },
    type: 'object',
};
//# sourceMappingURL=zero_ex_config_schema.js.map