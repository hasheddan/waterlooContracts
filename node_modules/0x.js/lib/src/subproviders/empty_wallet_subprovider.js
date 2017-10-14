"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * This class implements the web3-provider-engine subprovider interface and returns
 * that the provider has no addresses when queried.
 * Source: https://github.com/MetaMask/provider-engine/blob/master/subproviders/subprovider.js
 */
var EmptyWalletSubProvider = (function () {
    function EmptyWalletSubProvider() {
    }
    EmptyWalletSubProvider.prototype.handleRequest = function (payload, next, end) {
        switch (payload.method) {
            case 'eth_accounts':
                end(null, []);
                return;
            default:
                next();
                return;
        }
    };
    // Required to implement this method despite not needing it for this subprovider
    EmptyWalletSubProvider.prototype.setEngine = function (engine) {
        // noop
    };
    return EmptyWalletSubProvider;
}());
exports.EmptyWalletSubProvider = EmptyWalletSubProvider;
//# sourceMappingURL=empty_wallet_subprovider.js.map