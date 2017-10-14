var Web3 = require('web3');
var ZeroEx = require('0x.js').ZeroEx
var BigNumber = require('bignumber.js');

var provider = new Web3.providers.HttpProvider('http://localhost:8545');

var zeroEx = new ZeroEx(provider);

var express = require('express')

var app = express()

app.set("port", process.env.PORT || 8000);

app.get('/test', function(req, res) {
  zeroEx.getAvailableAddressesAsync()
    .then(function(availableAddresses) {
        console.log(availableAddresses);
        res.send(JSON.stringify(availableAddresses));
    })
    .catch(function(error) {
        console.log('Caught error: ', error);
    });
});


app.get('zerox', runThoughEverything);

app.listen(app.get("port"), function () {
  console.log('Server running on http://localhost:' + app.get("port"))
})

// TODO
/*
	Make npm start run the 0x testrpc commands as well

*/

// Goes through the whole zerox stuff
async function runThoughEverything(req, res) {
    await zeroEx.setProviderAsync(provider);
    let date = new Date();
    try {
        var availableAddresses = await zeroEx.exchange.getContractAddressAsync(); 
        let form = {
            "maker": web3.eth.accounts[0],
            "taker": web3.eth.accounts[1],
            "takerTokenAddress": await zeroEx.exchange.getZRXTokenAddressAsync(),
            "makerTokenAddress": await zeroEx.exchange.getZRXTokenAddressAsync(),
            "makerTokenAmount": new BigNumber("2"),
            "takerTokenAmount": new BigNumber("2"),
            "takerFee": new BigNumber("0"),
            "makerFee": new BigNumber("0"),
            "exchangeContractAddress": availableAddresses,
            "feeRecipient": web3.eth.accounts[0],
            "expirationUnixTimestampSec": new BigNumber(''+Math.floor(date/1000)+100000),
            "salt": ZeroEx.generatePseudoRandomSalt()
        }
        let hash = ZeroEx.getOrderHashHex(form);
        let success = await zeroEx.signOrderHashAsync(hash, web3.eth.accounts[0])
        form.ecSignature = success;
        let number = new BigNumber(1);
        // let tx = await zeroEx.exchange.validateFillOrderThrowIfInvalidAsync(form, number, web3.eth.accounts[0])
        let tx = await zeroEx.exchange.fillOrderAsync(form, number, true, web3.eth.accounts[1]);
        console.log(tx);
    } catch (error) {
        console.log(error);
    }
}