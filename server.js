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

app.use(bodyParser());

let addresses = [];
let orders = [];

app.set("port", process.env.PORT || 8080);
app.post('/create', createContract);
app.get('/accounts', getAccounts)
app.post('/createOrder', createOrder);
app.get('/fillOrder', fillOrder);
app.get('/exchange', exchange);
app.get('/tokens', getTokens);
app.get('/getBalance', getBalance);

let hash;

let tokenFactoryAddress = "0xb34cde0ad3a83d04abebc0b66e75196f22216621";
let tokenFactory = web3.eth.contract(require('./build/contracts/HumanStandardTokenFactory.json').abi).at(tokenFactoryAddress);

let token = web3.eth.contract(require('./build/contracts/HumanStandardToken.json')).abi;
let etherTokenAddress = zeroEx.exchange.getContractAddressAsync();

// Populate Orders on Server Start
fs.readFile(`./data/orders/${tokenFactoryAddress}.json`, function read(err, data) {
    if (err) {
        console.log("ORDER DATA NOT OBTAINED!!")
        throw err;
    }
    orders.push(JSON.parse(data));
    console.log(JSON.parse(data));
});

setTimeout(function(){
    var contractCreateEvent = tokenFactory.ContractCreated({_from:web3.eth.coinbase},{fromBlock: 0, toBlock: 'latest'});
    contractCreateEvent.watch(async function(err, result) {
      if (!err) {
        let token = { 
              owner: result.args.owner,
              contractAddress: result.args.contractAddress,
              name : result.args._name,
              symbol: result.args._symbol,
              dateCreated: result.args.dateCreated.toString() 
        }
        try {
            // get the contracts balance then allow 0x to use the entirety of those tokens
            let balance = await zeroEx.token.getBalanceAsync(result.args.contractAddress, result.args.owner)
            let response = await zeroEx.token.setProxyAllowanceAsync(result.args.contractAddress, result.args.owner, balance );
            addresses.push(token);
            fs.writeFile(`./data/tokens/${tokenFactoryAddress}.json`, JSON.stringify(addresses), (err , res) => {
                console.log(err);
            })
        } catch (e) {
            console.log(e);
        }
        return;
      }
    });
},5000);


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
    tokenFactory.createHumanStandardToken(req.body.initialAmount, req.body.name, req.body.symbol, req.body.expirationDate, {from: req.account || web3.eth.accounts[0], gas: 819686}, (err, resp) => {
        res.send({tx: resp});
    });
};

async function createOrder(req, res) {
    await zeroEx.setProviderAsync(provider);
    let date = new Date();
    try {
        var zrxContract = await zeroEx.exchange.getContractAddressAsync();
        let form = {
            "maker": req.body.maker,
            "taker": req.body.taker,
            "takerTokenAddress": req.body.takerTokenAddress,
            "makerTokenAddress": req.body.makerTokenAddress,
            "makerTokenAmount": new BigNumber(req.body.makerTokenAmount),
            "takerTokenAmount": new BigNumber(req.body.makerTokenAmount),
            "takerFee": new BigNumber(0),
            "makerFee": new BigNumber(0),
            "exchangeContractAddress": await zeroEx.exchange.getContractAddressAsync(),
            "feeRecipient": web3.eth.accounts[0],
            "expirationUnixTimestampSec": new BigNumber('' + Math.floor(date / 1000) + 100000),
            "salt": ZeroEx.generatePseudoRandomSalt()
        }
        hash = ZeroEx.getOrderHashHex(form);
        let signedHash = await zeroEx.signOrderHashAsync(hash, web3.eth.accounts[0]);
        form.ecSignature = signedHash;
        orders.push(form);
        fs.writeFile(`./data/orders/${tokenFactoryAddress}.json`, JSON.stringify(orders));
    } catch (error) {
        console.log(error);
        res.send({ error: error.toString() })
    }
    res.send(hash);
}

async function getBalance(req, res) {
}


async function fillOrder(req, res) {
    let form = req.body.form;
    let success = await zeroEx.signOrderHashAsync(req.hash, web3.eth.accounts[0])
    form.ecSignature = success;
    let number = new BigNumber(req.body.number);
    let txHash = {};
    try {
        txHash = await zeroEx.exchange.validateFillOrderThrowIfInvalidAsync(form, number, web3.eth.accounts[0])
        txHash = await zeroEx.exchange.fillOrderAsync(form, number, true, web3.eth.accounts[1]);  
    } catch(e) {
        console.log(e);
    }
    res.send(txHash);
}

async function exchange(req, res) {
    res.send(orders);
}

app.listen(app.get("port"), function () {
    console.log('Server running on http://localhost:' + app.get("port"))
})