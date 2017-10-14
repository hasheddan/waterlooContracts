"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var promisify = require("es6-promisify");
var _0x_json_schemas_1 = require("0x-json-schemas");
var types_1 = require("./types");
var Contract = (function () {
    function Contract(web3ContractInstance, defaults) {
        this.contract = web3ContractInstance;
        this.address = web3ContractInstance.address;
        this.abi = web3ContractInstance.abi;
        this.defaults = defaults;
        this.populateEvents();
        this.populateFunctions();
        this.validator = new _0x_json_schemas_1.SchemaValidator();
    }
    Contract.prototype.populateFunctions = function () {
        var _this = this;
        var functionsAbi = _.filter(this.abi, function (abiPart) { return abiPart.type === types_1.AbiType.Function; });
        _.forEach(functionsAbi, function (functionAbi) {
            if (functionAbi.constant) {
                var cbStyleCallFunction = _this.contract[functionAbi.name].call;
                _this[functionAbi.name] = {
                    callAsync: promisify(cbStyleCallFunction, _this.contract),
                };
            }
            else {
                var cbStyleFunction = _this.contract[functionAbi.name];
                var cbStyleEstimateGasFunction = _this.contract[functionAbi.name].estimateGas;
                _this[functionAbi.name] = {
                    estimateGasAsync: promisify(cbStyleEstimateGasFunction, _this.contract),
                    sendTransactionAsync: _this.promisifyWithDefaultParams(cbStyleFunction),
                };
            }
        });
    };
    Contract.prototype.populateEvents = function () {
        var _this = this;
        var eventsAbi = _.filter(this.abi, function (abiPart) { return abiPart.type === types_1.AbiType.Event; });
        _.forEach(eventsAbi, function (eventAbi) {
            _this[eventAbi.name] = _this.contract[eventAbi.name];
        });
    };
    Contract.prototype.promisifyWithDefaultParams = function (fn) {
        var _this = this;
        var promisifiedWithDefaultParams = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var promise = new Promise(function (resolve, reject) {
                var lastArg = args[args.length - 1];
                var txData = {};
                if (_this.isTxData(lastArg)) {
                    txData = args.pop();
                }
                txData = __assign({}, _this.defaults, txData);
                var callback = function (err, data) {
                    if (_.isNull(err)) {
                        resolve(data);
                    }
                    else {
                        reject(err);
                    }
                };
                args.push(txData);
                args.push(callback);
                fn.apply(_this.contract, args);
            });
            return promise;
        };
        return promisifiedWithDefaultParams;
    };
    Contract.prototype.isTxData = function (lastArg) {
        var isValid = this.validator.isValid(lastArg, _0x_json_schemas_1.schemas.txDataSchema);
        return isValid;
    };
    return Contract;
}());
exports.Contract = Contract;
//# sourceMappingURL=contract.js.map