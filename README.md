# **Congruence**
---
## Setup

Clone repository:
```git clone```

Install dependencies:
```npm install```

## Run
#### Start testrpc (with 0x) and server
```npm start```

#### Start testrpc (with 0x) only
```npm run testrpc```

*__Note__: testrpc default port is 8545*

#### Start server only
```npm run server```

*__Note__: server default port is 8000*

## API

#### POST: ```/create```: creates tokens and returns transaction hash
- *initialAmount*: (integer) amount of tokens to be issued
- *name*: (string) token name
- *symbol*: (string) 3 or 4 letter token symbol
- *expirationDate*: (integer) number of days that tokens are valid for

__Example__:
```
{
   “initialAmount”: 100,
   “name”:“pizza”,
   “symbol”:“PIZ”,
   “expirationDate”: 40
}
 ```

#### GET: ```/accounts```: returns public keys of all accounts

#### POST: ```/createOrder```: creates order and returns hash of order
- *maker*: (address) address of order maker
- *makerTokenAddress*: (address) address of token order maker
- *makerTokenAmount*: (integer) number of tokens maker is proposing trading in order
- *takerTokenAmount*: (integer) number of tokens maker is expecting to recieve from taker

__Example__:
```
{
   “maker”: “0x5409ed021d9299bf6814279a6a1411a7e866a631",
   “takerTokenAddress”: “0x48bacb9266a570d521063ef5dd96e61686dbe788",
   “makerTokenAddress”: “0x18bbba441315bab82d032b8c4e531fb050ea2d4c”,
   “makerTokenAmount”: “2",
   “takerTokenAmount”: “1"
}
 ```

#### GET: ```/fillOrder```: executes order and returns transaction hash
- *form*: (JSON object) JSON object obtained from order in the exchange
- *address*: (address) address of user who's token balances we desire to know
- *number*: (integer) number of tokens the taker will buy

#### GET: ```/exchange```: returns all outstanding orders

#### GET: ```/tokens```: returns all outstanding tokens

#### POST: ```/getBalance```: returns amount of each token held by owner of address paramater
- *address*: (address) address of user who's token balances we desire to know
