var Web3 = require('web3');
var ZeroEx = require('0x.js').ZeroEx
var BigNumber = require('bignumber.js');
var provider = new Web3.providers.HttpProvider('http://localhost:8545');
var web3 = new Web3(provider);
var zeroEx = new ZeroEx(provider);
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var cors = require('cors');

app.use(cors());
app.use(bodyParser());

let addresses = [];
let orders = [];

app.set("port", process.env.PORT || 8000);
app.post('/create', createContract);
app.get('/accounts', getAccounts)
app.post('/createOrder', createOrder);
app.post('/fillOrder', fillOrder);
app.get('/exchange', exchange);
app.get('/tokens', getTokens);
app.post('/getBalance', getBalance);

let hash;

let tokenFactoryAddress = "0xda705a76b79ef1d8c87bebde20e93bd7479cbe1a";
let tokenFactory = web3.eth.contract(require('./build/contracts/HumanStandardTokenFactory.json').abi).at(tokenFactoryAddress);

let token = web3.eth.contract(require('./build/contracts/HumanStandardToken.json')).abi;
let transferTokenProxy = web3.eth.contract(require('./data/TokenTransferProxy.json').abi);
try {
    // Populate Orders on Server Start
    fs.readFile(`./data/orders/${tokenFactoryAddress}.json`, function read(err, data) {
        if (!err) {
            orders = JSON.parse(data || []);
        }
    });
} catch (e) {

}

setTimeout(async function () {
    var contractCreateEvent = tokenFactory.ContractCreated({ _from: web3.eth.coinbase }, { fromBlock: 0, toBlock: 'latest' });
    contractCreateEvent.watch(async function (err, result) {
        if (!err) {
            let token = {
                owner: result.args.owner,
                contractAddress: result.args.contractAddress,
                name: result.args._name,
                symbol: result.args._symbol,
                dateCreated: result.args.dateCreated.toString()
            }
            try {
                // get the contracts balance then allow 0x to use the entirety of those tokens
                let balance = await zeroEx.token.getBalanceAsync(result.args.contractAddress, result.args.owner)
                let response = await zeroEx.token.setUnlimitedProxyAllowanceAsync(result.args.contractAddress, result.args.owner);
                addresses.push(token);
                fs.writeFile(`./data/tokens/${tokenFactoryAddress}.json`, JSON.stringify(addresses), (err, res) => {
                    console.log(err);
                })
                let transferTokenProxyAddress = await zeroEx.proxy.getContractAddressAsync();
                transferTokenProxy.at(transferTokenProxyAddress).addAuthorizedAddress(result.args.contractAddress, {from: web3.eth.accounts[0]}, (err, res) => {
                    console.log(res);
                });

            } catch (e) {
                console.log(e);
            }
            return;
        }
    });
    try {
        let accounts = await zeroEx.getAvailableAddressesAsync();
        // Give 10 ETHER TO CONTRACT ON INIT
        for (var i = 0; i < accounts.length; i++) {
            let balance = await zeroEx.token.getBalanceAsync(await zeroEx.etherToken.getContractAddressAsync(), accounts[i])
            console.log(+balance.toString());
            if (+balance.toString() < 1) {
                await zeroEx.etherToken.depositAsync(new BigNumber(10 * 10 ** 18), accounts[i]);
            }
        }
    } catch (e) {
        console.log(e);
    }
}, 5000);


async function getTokens(req, res) {
    res.send(addresses);
};

async function getAccounts(req, res) {
    zeroEx.getAvailableAddressesAsync()
        .then(function (availableAddresses) {
            res.send(JSON.stringify(availableAddresses));
        })
        .catch(function (error) {
            console.log('Caught error: ', error);
        });
}


async function createContract(req, res) {
    tokenFactory.createHumanStandardToken(req.body.initialAmount, req.body.name, req.body.symbol, req.body.expirationDate, { from: req.account || req.body.address, gas: 819686 }, (err, resp) => {
        res.send({ tx: resp });
    });
};

async function createOrder(req, res) {
    await zeroEx.setProviderAsync(provider);
    let date = new Date();
    try {
        var zrxContract = await zeroEx.exchange.getContractAddressAsync();
        let form = {
            "maker": req.body.maker,
            "taker": "0x0000000000000000000000000000000000000000",
            "takerTokenAddress": req.body.takerTokenAddress,
            "makerTokenAddress": req.body.makerTokenAddress,
            "makerTokenAmount": new BigNumber(req.body.makerTokenAmount),
            "takerTokenAmount": new BigNumber(req.body.takerTokenAmount),
            "takerFee": new BigNumber(0),
            "makerFee": new BigNumber(0),
            "exchangeContractAddress": await zeroEx.exchange.getContractAddressAsync(),
            "feeRecipient": req.body.maker,
            "expirationUnixTimestampSec": new BigNumber(Date.now() + 10000000),
            "salt": ZeroEx.generatePseudoRandomSalt()
        }
        hash = ZeroEx.getOrderHashHex(form);
        let signedHash = await zeroEx.signOrderHashAsync(hash, req.body.maker);
        form.ecSignature = signedHash;
        orders = orders || [];
        orders.push(form);
        fs.writeFile(`./data/orders/${tokenFactoryAddress}.json`, JSON.stringify(orders));
    } catch (error) {
        console.log(error);
        res.send({ error: error.toString() })
    }
    res.send({ hash });
}

async function getBalance(req, res) {
    let address = req.body.address;
    var stuff = [];
    fs.readFile(`./data/tokens/${tokenFactoryAddress}.json`, async function (err, resp) {
        if (err) {
            res.send(resp);
        }
        resp = JSON.parse(resp);

        // ADD ETHER TOKEN
        try {
            resp = resp.reverse();
            resp.push({
                contractAddress: await zeroEx.etherToken.getContractAddressAsync(),
                name: "Ether",
                symbol: "ETH"
            })
            resp = resp.reverse();

            for (var i = 0; i < resp.length; i++) {
                console.log(await zeroEx.token.getBalanceAsync(resp[i].contractAddress, address));
                resp[i].balance = await zeroEx.token.getBalanceAsync(resp[i].contractAddress, address);
            }
        } catch (e) {
            console.log(e);
        }
        res.send(resp);
    });
}


async function fillOrder(req, res) {
    let form = req.body.form;
    console.log(form);
    form.makerfee = new BigNumber(form.makerfee || 0);
    form.takerfee = new BigNumber(form.takerfee || 0);
    form.makerTokenAmount = new BigNumber(form.makerTokenAmount),
    form.takerTokenAmount =  new BigNumber(form.takerTokenAmount),
    form.expirationUnixTimestampSec = new BigNumber(form.expirationUnixTimestampSec || 0);
    let number = new BigNumber(req.body.number);
    let address = req.body.address;
    let txHash = {};
    let makerAllowance = await zeroEx.token.getProxyAllowanceAsync(form.makerTokenAddress, form.maker)
    let tkerAllowance = await zeroEx.token.getProxyAllowanceAsync(form.takerTokenAddress, form.taker);
    try {
        // txHash = await zeroEx.exchange.validateFillOrderThrowIfInvalidAsync(form, number, address);
        try {
            let response = await zeroEx.token.setUnlimitedProxyAllowanceAsync(form.takerTokenAddress, address);    
        } catch (e) {
            console.log(e);
        }
        console.log(address);
        txHash = await zeroEx.exchange.fillOrderAsync(form, number, false, address);
    } catch (e) {
        console.log(e);
    }
    res.send({ txHash  });

}

async function exchange(req, res) {
    res.send(orders || []);
}

async function init() {
    addresses = addresses.reverse();
    addresses.push({
        contractAddress: await zeroEx.etherToken.getContractAddressAsync(),
        name: "Ether",
        symbol: "ETH"
    })
    addresses = addresses.reverse();
}

app.listen(app.get("port"), function () {
    console.log('Server running on http://localhost:' + app.get("port"))
})

init()