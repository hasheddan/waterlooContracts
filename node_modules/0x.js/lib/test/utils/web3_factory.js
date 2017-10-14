"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// HACK: web3 injects XMLHttpRequest into the global scope and ProviderEngine checks XMLHttpRequest
// to know whether it is running in a browser or node environment. We need it to be undefined since
// we are not running in a browser env.
// Filed issue: https://github.com/ethereum/web3.js/issues/844
global.XMLHttpRequest = undefined;
var ProviderEngine = require("web3-provider-engine");
var RpcSubprovider = require("web3-provider-engine/subproviders/rpc");
var Web3 = require("web3");
var constants_1 = require("./constants");
var empty_wallet_subprovider_1 = require("../../src/subproviders/empty_wallet_subprovider");
exports.web3Factory = {
    create: function (hasAddresses) {
        if (hasAddresses === void 0) { hasAddresses = true; }
        var provider = this.getRpcProvider(hasAddresses);
        var web3 = new Web3();
        web3.setProvider(provider);
        return web3;
    },
    getRpcProvider: function (hasAddresses) {
        if (hasAddresses === void 0) { hasAddresses = true; }
        var provider = new ProviderEngine();
        var rpcUrl = "http://" + constants_1.constants.RPC_HOST + ":" + constants_1.constants.RPC_PORT;
        if (!hasAddresses) {
            provider.addProvider(new empty_wallet_subprovider_1.EmptyWalletSubProvider());
        }
        provider.addProvider(new RpcSubprovider({
            rpcUrl: rpcUrl,
        }));
        provider.start();
        return provider;
    },
};
//# sourceMappingURL=web3_factory.js.map