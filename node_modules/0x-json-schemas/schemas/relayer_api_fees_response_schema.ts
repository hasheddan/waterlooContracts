export const relayerApiFeesResponseSchema = {
    id: '/RelayerApiFeesResponse',
    type: 'object',
    properties: {
        makerFee: {$ref: '/Number'},
        takerFee: {$ref: '/Number'},
        feeRecipient: {$ref: '/Address'},
        takerToSpecify: {$ref: '/Address'},
    },
    required: ['makerFee', 'takerFee'],
};
