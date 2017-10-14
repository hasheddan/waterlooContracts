var Web3 = require('web3');
var ZeroEx = require('0x.js').ZeroEx
var BigNumber = require('bignumber.js');
var provider = new Web3.providers.HttpProvider('http://localhost:8545');
var web3 = new Web3(provider);
var zeroEx = new ZeroEx(provider);
var express = require('express');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser());

app.set("port", process.env.PORT || 8000);
app.post('/create', createContract);
app.get('/accounts', getAccounts)
app.get('/submitTransaction', submitTransaction);

app.get('/fillOrder', fillOrder);

let hash;

let tokenFactory = web3.eth.contract(require('./build/contracts/HumanStandardTokenFactory.json').abi).at("0x2ebb94cc79d7d0f1195300aaf191d118f53292a8");

let token = web3.eth.contract(require('./build/contracts/HumanStandardToken.json')).abi;

setTimeout(function(){
    console.log("_______________________");
    var contractCreateEvent = tokenFactory.ContractCreated({_from:web3.eth.coinbase},{fromBlock: 0, toBlock: 'latest'});
    contractCreateEvent.watch(function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("here");
      console.log(result);
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
    res.send(tx);
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
        res.send(success);
    } catch (error) {
        console.log(error);
        res.send({ error: error.toString() })
    }
    res.send({ "fd": "ds" })
}

async function fillOrder(req, res) {
    let form = {};
    console.log(hash);
    let success = await zeroEx.signOrderHashAsync(hash, web3.eth.accounts[0])
    // form.ecSignature = success;
    console.log(form);
    res.send(success);
}


app.listen(app.get("port"), function () {
    console.log('Server running on http://localhost:' + app.get("port"))
})