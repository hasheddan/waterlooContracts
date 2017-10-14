var Web3 = require('web3');
var ZeroEx = require('0x.js').ZeroEx

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

app.listen(app.get("port"), function () {
  console.log('Server running on http://localhost:' + app.get("port"))
})

// TODO
/*
	Make npm start run the 0x testrpc commands as well

*/