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

app.set("port", process.env.PORT || 8000);
app.post('/create', createContract);
app.get('/accounts', getAccounts)
app.get('/submitTransaction', submitTransaction);
app.get('/fillOrder', fillOrder);
app.get('/exchange', exchange);
app.get('/getBalance', getBalance);

let hash;
let tokenFactoryAddress = "0x99356167edba8fbdc36959e3f5d0c43d1ba9c6db";
let tokenFactory = web3.eth.contract(require('./build/contracts/HumanStandardTokenFactory.json').abi).at(tokenFactoryAddress);

let token = web3.eth.contract(require('./build/contracts/HumanStandardToken.json')).abi;
let etherTokenAddress = zeroEx.exchange.getContractAddressAsync();

setTimeout(function(){
    var contractCreateEvent = tokenFactory.ContractCreated({_from:web3.eth.coinbase},{fromBlock: 0, toBlock: 'latest'});
    contractCreateEvent.watch(function(err, result) {
      if (!err) {
        let token = { 
              owner: result.args.owner,
              contractAddress: result.args.contractAddress,
              name : result.args._name,
              symbol: result.args._symbol,
              dateCreated: result.args.dateCreated.toString() 
        }
        let balance = zeroEx.token.getBalanceAsync(result.args.contractAddress, result.args.owner)
        await zeroEx.token.setProxyAllowanceAsync(result.args.contractAddress, result.args.owner, balance );
        addresses.push(token);
        fs.writeFile(`./data/tokens/${tokenFactoryAddress}.json`, JSON.stringify(addresses), (err , res) => {
            console.log(err);
        })
        return;
      }
    });
},5000);


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
    tokenFactory.createHumanStandardToken(req.body.initialAmount, req.body.name, req.body.symbol, req.body.expirationDate, {from: req.account || web3.eth.accounts[0], gas: 819686}, (err, res) => {
        console.log(err, res);
    });
    res.send({'success': true});
};

async function submitTransaction(req, res) {
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
            "takerFee": new BigNumber(req.body.takerFee),
            "makerFee": new BigNumber(req.body.makerFee),
            "exchangeContractAddress": await zeroEx.exchange.getContractAddressAsync(),
            "feeRecipient": web3.eth.accounts[0],
            "expirationUnixTimestampSec": new BigNumber('' + Math.floor(date / 1000) + 100000),
            "salt": ZeroEx.generatePseudoRandomSalt()
        }
        hash = ZeroEx.getOrderHashHex(form);
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
    let tx = {};
    try {
        tx = await zeroEx.exchange.validateFillOrderThrowIfInvalidAsync(form, number, web3.eth.accounts[0])
        tx = await zeroEx.exchange.fillOrderAsync(form, number, true, web3.eth.accounts[1]);  
        fs.writeFile(`./data/orders/${tokenFactoryAddress}.json`, orders);
    } catch(e) {
        console.log(e);
    }
    res.send(tx);
}

async function exchange(req, res) {
    res.send();
}

app.listen(app.get("port"), function () {
    console.log('Server running on http://localhost:' + app.get("port"))
})