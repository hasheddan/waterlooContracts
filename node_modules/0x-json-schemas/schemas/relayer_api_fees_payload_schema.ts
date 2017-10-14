export const relayerApiFeesPayloadSchema = {
    id: '/RelayerApiFeesPayload',
    type: 'object',
    properties: {
        maker: {$ref: '/Address'},
        taker: {$ref: '/Address'},
        makerTokenAddress: {$ref: '/Address'},
        takerTokenAddress: {$ref: '/Address'},
        makerTokenAmount: {$ref: '/Number'},
        takerTokenAmount: {$ref: '/Number'},
    },
    required: ['makerTokenAddress', 'takerTokenAddress', 'makerTokenAmount', 'takerTokenAmount'],
};
