import 'mocha';
import * as _ from 'lodash';
import * as dirtyChai from 'dirty-chai';
import * as chai from 'chai';
import * as BigNumber from 'bignumber.js';
import promisify = require('es6-promisify');
import {SchemaValidator, schemas} from '../src/index';

chai.config.includeStack = true;
chai.use(dirtyChai);
const expect = chai.expect;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const {
    numberSchema,
    addressSchema,
    ecSignatureSchema,
    ecSignatureParameterSchema,
    indexFilterValuesSchema,
    orderCancellationRequestsSchema,
    orderFillOrKillRequestsSchema,
    orderFillRequestsSchema,
    orderHashSchema,
    orderSchema,
    signedOrderSchema,
    signedOrdersSchema,
    blockParamSchema,
    subscriptionOptsSchema,
    tokenSchema,
    jsNumber,
    txDataSchema,
    relayerApiErrorResponseSchema,
    relayerApiFeesPayloadSchema,
    relayerApiFeesResponseSchema,
    relayerApiOrderResponseSchema,
    relayerApiOrdersResponseSchema,
    relayerApiTokenPairsResponseSchema,
} = schemas;

describe('Schema', () => {
    const validator = new SchemaValidator();
    const validateAgainstSchema = (testCases: any[], schema: any, shouldFail = false) => {
        _.forEach(testCases, (testCase: any) => {
            const validationResult = validator.validate(testCase, schema);
            const hasErrors = validationResult.errors.length !== 0;
            if (shouldFail) {
                if (!hasErrors) {
                    throw new Error(
                        `Expected testCase: ${JSON.stringify(testCase, null, '\t')} to fail and it didn't.`,
                    );
                }
            } else {
                if (hasErrors) {
                    throw new Error(JSON.stringify(validationResult.errors, null, '\t'));
                }
            }
        });
    };
    describe('#numberSchema', () => {
        it('should validate valid numbers', () => {
            const testCases = ['42', '0', '1.3', '0.2', '00.00'];
            validateAgainstSchema(testCases, numberSchema);
        });
        it('should fail for invalid numbers', () => {
            const testCases = ['.3', '1.', 'abacaba', 'и', '1..0'];
            const shouldFail = true;
            validateAgainstSchema(testCases, numberSchema, shouldFail);
        });
    });
    describe('#addressSchema', () => {
        it('should validate valid addresses', () => {
            const testCases = ['0x8b0292b11a196601ed2ce54b665cafeca0347d42', NULL_ADDRESS];
            validateAgainstSchema(testCases, addressSchema);
        });
        it('should fail for invalid addresses', () => {
            const testCases = [
                '0x',
                '0',
                '0x00',
                '0xzzzzzzB11a196601eD2ce54B665CaFEca0347D42',
                '0x8b0292B11a196601eD2ce54B665CaFEca0347D42',
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, addressSchema, shouldFail);
        });
    });
    describe('#ecSignatureParameterSchema', () => {
        it('should validate valid parameters', () => {
            const testCases = [
                '0x61a3ed31b43c8780e905a260a35faefcc527be7516aa11c0256729b5b351bc33',
                '0X40349190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254',
            ];
            validateAgainstSchema(testCases, ecSignatureParameterSchema);
        });
        it('should fail for invalid parameters', () => {
            const testCases = [
                '0x61a3ed31b43c8780e905a260a35faefcc527be7516aa11c0256729b5b351bc3',  // shorter
                '0xzzzz9190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254', // invalid characters
                '40349190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254',   // no 0x
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, ecSignatureParameterSchema, shouldFail);
        });
    });
    describe('#ecSignatureSchema', () => {
        it('should validate valid signature', () => {
            const signature = {
                v: 27,
                r: '0x61a3ed31b43c8780e905a260a35faefcc527be7516aa11c0256729b5b351bc33',
                s: '0x40349190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254',
            };
            const testCases = [
                signature,
                {
                    ...signature,
                    v: 28,
                },
            ];
            validateAgainstSchema(testCases, ecSignatureSchema);
        });
        it('should fail for invalid signature', () => {
            const v = 27;
            const r = '0x61a3ed31b43c8780e905a260a35faefcc527be7516aa11c0256729b5b351bc33';
            const s = '0x40349190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254';
            const testCases = [
                {},
                {v},
                {r, s, v: 31},
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, ecSignatureSchema, shouldFail);
        });
    });
    describe('#orderHashSchema', () => {
        it('should validate valid order hash', () => {
            const testCases = [
                '0x61a3ed31B43c8780e905a260a35faefEc527be7516aa11c0256729b5b351bc33',
                '0x40349190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254',
            ];
            validateAgainstSchema(testCases, orderHashSchema);
        });
        it('should fail for invalid order hash', () => {
            const testCases = [
                {},
                '0x',
                '0x8b0292B11a196601eD2ce54B665CaFEca0347D42',
                '61a3ed31B43c8780e905a260a35faefEc527be7516aa11c0256729b5b351bc33',
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, orderHashSchema, shouldFail);
        });
    });
    describe('#blockParamSchema', () => {
        it('should validate valid block param', () => {
            const testCases = [
                42,
                'latest',
                'pending',
                'earliest',
            ];
            validateAgainstSchema(testCases, blockParamSchema);
        });
        it('should fail for invalid block param', () => {
            const testCases = [
                {},
                '42',
                'pemding',
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, blockParamSchema, shouldFail);
        });
    });
    describe('#subscriptionOptsSchema', () => {
        it('should validate valid subscription opts', () => {
            const testCases = [
                {fromBlock: 42, toBlock: 'latest'},
                {fromBlock: 42},
                {},
            ];
            validateAgainstSchema(testCases, subscriptionOptsSchema);
        });
        it('should fail for invalid subscription opts', () => {
            const testCases = [
                {fromBlock: '42'},
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, subscriptionOptsSchema, shouldFail);
        });
    });
    describe('#tokenSchema', () => {
        const token = {
            name: 'Zero Ex',
            symbol: 'ZRX',
            decimals: 100500,
            address: '0x8b0292b11a196601ed2ce54b665cafeca0347d42',
            url: 'https://0xproject.com',
        };
        it('should validate valid token', () => {
            const testCases = [
                token,
            ];
            validateAgainstSchema(testCases, tokenSchema);
        });
        it('should fail for invalid token', () => {
            const testCases = [
                {
                    ...token,
                    address: null,
                },
                {
                    ...token,
                    decimals: undefined,
                },
                [],
                4,
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, tokenSchema, shouldFail);
        });
    });
    describe('order including schemas', () => {
        const order = {
            maker: NULL_ADDRESS,
            taker: NULL_ADDRESS,
            makerFee: '1',
            takerFee: '2',
            makerTokenAmount: '1',
            takerTokenAmount: '2',
            makerTokenAddress: NULL_ADDRESS,
            takerTokenAddress: NULL_ADDRESS,
            salt: '256',
            feeRecipient: NULL_ADDRESS,
            exchangeContractAddress: NULL_ADDRESS,
            expirationUnixTimestampSec: '42',
        };
        describe('#orderSchema', () => {
            it('should validate valid order', () => {
                const testCases = [
                    order,
                ];
                validateAgainstSchema(testCases, orderSchema);
            });
            it('should fail for invalid order', () => {
                const testCases = [
                    {
                        ...order,
                        salt: undefined,
                    },
                    {
                        ...order,
                        salt: 'salt',
                    },
                    'order',
                ];
                const shouldFail = true;
                validateAgainstSchema(testCases, orderSchema, shouldFail);
            });
        });
        describe('signed order including schemas', () => {
            const signedOrder = {
                ...order,
                ecSignature: {
                    v: 27,
                    r: '0x61a3ed31b43c8780e905a260a35faefcc527be7516aa11c0256729b5b351bc33',
                    s: '0x40349190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254',
                },
            };
            describe('#signedOrdersSchema', () => {
                it('should validate valid signed orders', () => {
                    const testCases = [
                        [signedOrder],
                    ];
                    validateAgainstSchema(testCases, signedOrdersSchema);
                });
                it('should fail for invalid signed orders', () => {
                    const testCases = [
                        [
                            signedOrder,
                            1,
                        ],
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, signedOrdersSchema, shouldFail);
                });
            });
            describe('#signedOrderSchema', () => {
                it('should validate valid signed order', () => {
                    const testCases = [
                        signedOrder,
                    ];
                    validateAgainstSchema(testCases, signedOrderSchema);
                });
                it('should fail for invalid signed order', () => {
                    const testCases = [
                        {
                            ...signedOrder,
                            ecSignature: undefined,
                        },
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, signedOrderSchema, shouldFail);
                });
            });
            describe('#orderFillOrKillRequestsSchema', () => {
                const orderFillOrKillRequests = [
                    {
                        signedOrder,
                        fillTakerAmount: '5',
                    },
                ];
                it('should validate valid order fill or kill requests', () => {
                    const testCases = [
                        orderFillOrKillRequests,
                    ];
                    validateAgainstSchema(testCases, orderFillOrKillRequestsSchema);
                });
                it('should fail for invalid order fill or kill requests', () => {
                    const testCases = [
                        [
                            {
                                ...orderFillOrKillRequests[0],
                                fillTakerAmount: undefined,
                            },
                        ],
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, orderFillOrKillRequestsSchema, shouldFail);
                });
            });
            describe('#orderCancellationRequestsSchema', () => {
                const orderCancellationRequests = [
                    {
                        order,
                        takerTokenCancelAmount: '5',
                    },
                ];
                it('should validate valid order cancellation requests', () => {
                    const testCases = [
                        orderCancellationRequests,
                    ];
                    validateAgainstSchema(testCases, orderCancellationRequestsSchema);
                });
                it('should fail for invalid order cancellation requests', () => {
                    const testCases = [
                        [
                            {
                                ...orderCancellationRequests[0],
                                takerTokenCancelAmount: undefined,
                            },
                        ],
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, orderCancellationRequestsSchema, shouldFail);
                });
            });
            describe('#orderFillRequestsSchema', () => {
                const orderFillRequests = [
                    {
                        signedOrder,
                        takerTokenFillAmount: '5',
                    },
                ];
                it('should validate valid order fill requests', () => {
                    const testCases = [
                        orderFillRequests,
                    ];
                    validateAgainstSchema(testCases, orderFillRequestsSchema);
                });
                it('should fail for invalid order fill requests', () => {
                    const testCases = [
                        [
                            {
                                ...orderFillRequests[0],
                                takerTokenFillAmount: undefined,
                            },
                        ],
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, orderFillRequestsSchema, shouldFail);
                });
            });
            describe('#relayerApiOrderResponseSchema', () => {
                it('should validate valid order payload', () => {
                    const testCases = [
                        {
                            signedOrder,
                            state: 'OPEN',
                            remainingTakerTokenAmount: '1000000000000000000',
                        },
                        {
                            signedOrder,
                            state: 'OPEN',
                            pending: {
                                fillAmount: '100000000000000000',
                                cancelAmount: '100000000000000000',
                            },
                            remainingTakerTokenAmount: '8000000000000000000',
                        },
                    ];
                    validateAgainstSchema(testCases, relayerApiOrderResponseSchema);
                });
                it('should fail for invalid order responses', () => {
                    const testCases = [
                        {},
                        {
                            signedOrder,
                            state: 'OPEN',
                            remainingTakerTokenAmount: 1000000000000000000,
                        },
                        {
                            signedOrder,
                            state: 'NOT_A_STATE',
                            remainingTakerTokenAmount: '1000000000000000000',
                        },
                        {
                            signedOrder,
                            state: 'OPEN',
                            pending: {
                                fillAmount: 100000000000000000,
                            },
                            remainingTakerTokenAmount: '8000000000000000000',
                        },
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, relayerApiOrderResponseSchema, shouldFail);
                });
            });
            describe('#relayerApiOrdersResponseSchema', () => {
                it('should validate valid orders payload', () => {
                    const testCases = [
                        [],
                        [
                            {
                                signedOrder,
                                state: 'OPEN',
                                remainingTakerTokenAmount: '1000000000000000000',
                            },
                        ],
                        [
                            {
                                signedOrder,
                                state: 'OPEN',
                                pending: {
                                    fillAmount: '100000000000000000',
                                    cancelAmount: '100000000000000000',
                                },
                                remainingTakerTokenAmount: '8000000000000000000',
                            },
                        ],
                    ];
                    validateAgainstSchema(testCases, relayerApiOrdersResponseSchema);
                });
                it('should fail for invalid orders responses', () => {
                    const testCases = [
                        [
                            {
                                signedOrder,
                                state: 'OPEN',
                                remainingTakerTokenAmount: 1000000000000000000,
                            },
                        ],
                        [
                            {
                                signedOrder,
                                state: 'NOT_A_STATE',
                                remainingTakerTokenAmount: '1000000000000000000',
                            },
                        ],
                        [
                            {
                                signedOrder,
                                state: 'OPEN',
                                pending: {
                                    fillAmount: 100000000000000000,
                                },
                                remainingTakerTokenAmount: '8000000000000000000',
                            },
                        ],
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, relayerApiOrdersResponseSchema, shouldFail);
                });
            });
        });
    });
    describe('BigNumber serialization', () => {
        it('should correctly serialize BigNumbers', () => {
            const testCases = {
                '42': '42',
                '0': '0',
                '1.3': '1.3',
                '0.2': '0.2',
                '00.00': '0',
                '.3': '0.3',
            };
            _.forEach(testCases, (serialized: string, input: string) => {
                expect(JSON.parse(JSON.stringify(new BigNumber(input)))).to.be.equal(serialized);
            });
        });
    });
    describe('#relayerApiErrorResponseSchema', () => {
        it('should validate valid errorResponse', () => {
            const testCases = [
                {
                    code: 102,
                    reason: 'Order submission disabled',
                },
                {
                    code: 101,
                    reason: 'Validation failed',
                    validationErrors: [
                        {
                            field: 'maker',
                            code: 1002,
                            reason: 'Invalid address',
                        },
                    ],
                },
            ];
            validateAgainstSchema(testCases, relayerApiErrorResponseSchema);
        });
        it('should fail for invalid error responses', () => {
            const testCases = [
                {},
                {
                    code: 102,
                },
                {
                    code: '102',
                    reason: 'Order submission disabled',
                },
                {
                    reason: 'Order submission disabled',
                },
                {
                    code: 101,
                    reason: 'Validation failed',
                    validationErrors: [
                        {
                            field: 'maker',
                            reason: 'Invalid address',
                        },
                    ],
                },
                {
                    code: 101,
                    reason: 'Validation failed',
                    validationErrors: [
                        {
                            field: 'maker',
                            code: '1002',
                            reason: 'Invalid address',
                        },
                    ],
                },
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, relayerApiErrorResponseSchema, shouldFail);
        });
    });
    describe('#relayerApiFeesPayloadSchema', () => {
        it('should validate valid fees payloads', () => {
            const testCases = [
                {
                    makerTokenAddress: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                    takerTokenAddress: '0xef7fff64389b814a946f3e92105513705ca6b990',
                    makerTokenAmount: '10000000000000000000',
                    takerTokenAmount: '30000000000000000000',
                },
                {
                    maker: '0x9e56625509c2f60af937f23b7b532600390e8c8b',
                    taker: '0xa2b31dacf30a9c50ca473337c01d8a201ae33e32',
                    makerTokenAddress: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                    takerTokenAddress: '0xef7fff64389b814a946f3e92105513705ca6b990',
                    makerTokenAmount: '10000000000000000000',
                    takerTokenAmount: '30000000000000000000',
                },
                {
                    maker: '0x9e56625509c2f60af937f23b7b532600390e8c8b',
                    makerTokenAddress: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                    takerTokenAddress: '0xef7fff64389b814a946f3e92105513705ca6b990',
                    makerTokenAmount: '10000000000000000000',
                    takerTokenAmount: '30000000000000000000',
                },
            ];
            validateAgainstSchema(testCases, relayerApiFeesPayloadSchema);
        });
        it('should fail for invalid fees payloads', () => {
            const checksummedAddress = '0xA2b31daCf30a9C50ca473337c01d8A201ae33e32';
            const testCases = [
                {},
                {
                    takerTokenAddress: '0xef7fff64389b814a946f3e92105513705ca6b990',
                    makerTokenAmount: '10000000000000000000',
                    takerTokenAmount: '30000000000000000000',
                },
                {
                    taker: checksummedAddress,
                    makerTokenAddress: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                    takerTokenAddress: '0xef7fff64389b814a946f3e92105513705ca6b990',
                    makerTokenAmount: '10000000000000000000',
                    takerTokenAmount: '30000000000000000000',
                },
                {
                    makerTokenAddress: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                    takerTokenAddress: '0xef7fff64389b814a946f3e92105513705ca6b990',
                    makerTokenAmount: 10000000000000000000,
                    takerTokenAmount: 30000000000000000000,
                },
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, relayerApiFeesPayloadSchema, shouldFail);
        });
    });
    describe('#relayerApiFeesResponseSchema', () => {
        it('should validate valid fees responses', () => {
            const testCases = [
                {
                    makerFee: '10000000000000000',
                    takerFee: '30000000000000000',
                },
                {
                    feeRecipient: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                    makerFee: '10000000000000000',
                    takerFee: '30000000000000000',
                },
                {
                    takerToSpecify: '0xef7fff64389b814a946f3e92105513705ca6b990',
                    makerFee: '10000000000000000',
                    takerFee: '30000000000000000',
                },
            ];
            validateAgainstSchema(testCases, relayerApiFeesResponseSchema);
        });
        it('should fail for invalid fees responses', () => {
            const checksummedAddress = '0xA2b31daCf30a9C50ca473337c01d8A201ae33e32';
            const testCases = [
                {},
                {
                    makerFee: 10000000000000000,
                    takerFee: 30000000000000000,
                },
                {
                    feeRecipient: checksummedAddress,
                    takerToSpecify: checksummedAddress,
                    makerFee: '10000000000000000',
                    takerFee: '30000000000000000',
                },
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, relayerApiFeesResponseSchema, shouldFail);
        });
    });
    describe('#relayerApiTokenPairsResponseSchema', () => {
        it('should validate valid tokenPairs response', () => {
            const testCases = [
                [],
                [
                    {
                        tokenA: {
                            address: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                            symbol: 'MKR',
                            decimals: 18,
                            minAmount: '0',
                            maxAmount: '10000000000000000000',
                            precision: 5,
                        },
                        tokenB: {
                            address: '0xef7fff64389b814a946f3e92105513705ca6b990',
                            symbol: 'GLM',
                            decimals: 18,
                            minAmount: '0',
                            maxAmount: '50000000000000000000',
                            precision: 5,
                        },
                    },
                ],
                [
                    {
                        tokenA: {
                            address: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                            symbol: 'MKR',
                            decimals: 18,
                        },
                        tokenB: {
                            address: '0xef7fff64389b814a946f3e92105513705ca6b990',
                            symbol: 'GLM',
                            decimals: 18,
                        },
                    },
                ],
            ];
            validateAgainstSchema(testCases, relayerApiTokenPairsResponseSchema);
        });
        it('should fail for invalid tokenPairs responses', () => {
            const checksummedAddress = '0xA2b31daCf30a9C50ca473337c01d8A201ae33e32';
            const testCases = [
                [
                    {
                        tokenA: {
                            address: checksummedAddress,
                            symbol: 'MKR',
                            decimals: 18,
                        },
                        tokenB: {
                            address: checksummedAddress,
                            symbol: 'GLM',
                            decimals: 18,
                        },
                    },
                ],
                [
                    {
                        tokenA: {
                            address: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                            symbol: 'MKR',
                            decimals: '18',
                        },
                        tokenB: {
                            address: '0xef7fff64389b814a946f3e92105513705ca6b990',
                            symbol: 'GLM',
                            decimals: '18',
                        },
                    },
                ],
                [
                    {
                        tokenA: {
                            address: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                            symbol: 'MKR',
                        },
                        tokenB: {
                            address: '0xef7fff64389b814a946f3e92105513705ca6b990',
                            symbol: 'GLM',
                        },
                    },
                ],
                [
                    {
                        tokenA: {
                            address: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                            symbol: 'MKR',
                            decimals: 18,
                            minAmount: 0,
                            maxAmount: 10000000000000000000,
                        },
                        tokenB: {
                            address: '0xef7fff64389b814a946f3e92105513705ca6b990',
                            symbol: 'GLM',
                            decimals: 18,
                            minAmount: 0,
                            maxAmount: 50000000000000000000,
                        },
                    },
                ],
                [
                    {
                        tokenA: {
                            address: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
                            symbol: 'MKR',
                            decimals: 18,
                            precision: '5',
                        },
                        tokenB: {
                            address: '0xef7fff64389b814a946f3e92105513705ca6b990',
                            symbol: 'GLM',
                            decimals: 18,
                            precision: '5',
                        },
                    },
                ],
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, relayerApiTokenPairsResponseSchema, shouldFail);
        });
    });
    describe('#jsNumberSchema', () => {
        it('should validate valid js number', () => {
            const testCases = [
                1,
                42,
            ];
            validateAgainstSchema(testCases, jsNumber);
        });
        it('should fail for invalid js number', () => {
            const testCases = [
                NaN,
                -1,
                new BigNumber(1),
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, jsNumber, shouldFail);
        });
    });
    describe('#txDataSchema', () => {
        it('should validate valid txData', () => {
            const testCases = [
                {
                    from: NULL_ADDRESS,
                },
                {
                    from: NULL_ADDRESS,
                    gas: new BigNumber(42),
                },
                {
                    from: NULL_ADDRESS,
                    gas: 42,
                },
            ];
            validateAgainstSchema(testCases, txDataSchema);
        });
        it('should fail for invalid txData', () => {
            const testCases = [
                {
                    gas: new BigNumber(42),
                },
                {
                    from: NULL_ADDRESS,
                    unknownProp: 'here',
                },
                {},
                [],
                new BigNumber(1),
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, txDataSchema, shouldFail);
        });
    });
});
