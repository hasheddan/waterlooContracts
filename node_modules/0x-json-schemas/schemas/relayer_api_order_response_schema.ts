export const relayerApiOrdersResponseSchema = {
    id: '/RelayerApiOrdersResponse',
    type: 'array',
    items: {$ref: '/RelayerApiOrderResponse'},
};

export const relayerApiOrderResponseSchema = {
    id: '/RelayerApiOrderResponse',
    type: 'object',
    properties: {
        signedOrder: {$ref: '/SignedOrder'},
        state: {
            enum: ['OPEN', 'EXPIRED', 'CLOSED', 'UNFUNDED'],
        },
        pending: {
            type: 'object',
            properties: {
                fillAmount: {$ref: '/Number'},
                cancelAmount: {$ref: '/Number'},
            },
        },
        remainingTakerTokenAmount: {$ref: '/Number'},
    },
    required: ['signedOrder', 'state', 'remainingTakerTokenAmount'],

};
