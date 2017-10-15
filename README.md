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

#### POST: ```/create```
*initialAmount*: (integer) amount of tokens to be issued
*name*: (string) token name
*symbol*: (string) 3 or 4 letter token symbol
*expirationDate*: (integer) number of days that tokens are valid for

#### GET: ```/accounts```

#### POST: ```/createOrder```
*maker*: (address) address of order maker
*makerTokenAddress*: (address) address of token order maker 
