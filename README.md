# CSPR.FYI Block Explorer API

## Account

### Account details

This endpoint returns an account's summary details.

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}`

Params:
`accountHash` or `publicKey`

e.g. https://api.cspr.fyi/v1/accounts/02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1

```
{
  "totalStaked": 2086945.7319812428,
  "publicKey": "02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1",
  "totalReward": 10430.666575932,
  "unstaking": 0,
  "availableBalance": 181.318,
  "totalBalance": 2087127.0499812427,
  "accountHash": "6111c212f0a72fe804348e37911193a70fc565fd6f05a730f05970d66f733089"
}
```

### Account transfers

This returns both incoming and outgoing transfers that the account has transacted.
Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}/transfers?startIndex=1&count=10`

Params: `accountHash` or `publicKey`

Query: `startIndex` and `count`.

`startIndex` is the beginning of a page and should always begin with one and increment by `count`.

`count` is the represents the number of items in a page.

e.g. https://api.cspr.fyi/v1/accounts/trans02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1/transfers?startIndex=1&count=2

```
[
  {
    "_id": "63505ca837bc4a6fcdf15a35",
    "deployHash": "a56dcbc4a13236d1c1b7e88a8b54b7daeee92b6aa928ce509107fe6b6bf77436",
    "amount": 49791.3008,
    "blockHash": "370e8c532ce53f69c678b47674bdcfcc8d5f9bddfad298c1d7ed11b1f11dd3cc",
    "contractHash": "",
    "cost": 0.1,
    "deployType": "transfer",
    "entryPoint": "transfer",
    "fromAccountBalance": 316393651.42683244,
    "fromAccountHash": "94664ce59fa2e6eb0cc69d270fc91dd9dd2ba02a1f7964c69f036ef4a68bb96f",
    "publicKey": "01b92e36567350dd7b339d709bfe341df6fda853e85315418f1bb3ddd414d9f5be",
    "status": "success",
    "timestamp": "2022-10-19T20:22:14.663Z",
    "toAccountBalance": 50378.8008,
    "toAccountHash": "0cc5cb742e78d72dd2ecd7d9ac0c9944d3b00c4badadd44b17e99d892d5a9553",
    "validator": ""
  },
  ...
]
```
