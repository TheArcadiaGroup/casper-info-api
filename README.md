# CSPR.FYI Block Explorer API

## Accounts

### Top Accounts

This returns a list of accounts ranked by their total balances.

Endpoint: `https://api.cspr.fyi/v1/accounts/top-accounts?startIndex=1&count=10`

Method: `GET`

Query: `startIndex` and `count`.

`startIndex` is the beginning of a page and should always begin with one and increment by `count`.

`count` is the represents the number of items in a page.

e.g. https://api.cspr.fyi/v1/accounts/top-accounts?startIndex=1&count=10

```json
[
  {
    "_id": "63564614d5a74761f178dd8d",
    "publicKey": "02035c47ccbeaa32040d6904b6dc163c3b546314c52b2a78583835f54a224ab365a4",
    "accountHash": "b8e119b446f65536e4cc213fba4a0e38533007ae5dea52c4618a86647ccc873a",
    "transferrable": 9898.8,
    "stakedAmount": 1090592984.9395216,
    "balance": 1090602883.7395215,
    "transactionCount": 34,
    "activeDate": "2021-05-06T15:12:27.259Z"
  }
  ...
]
```

### Account Details

This endpoint returns an account's summary details.

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}`

Method: `GET`

Params:
`accountHash` or `publicKey`

e.g. https://api.cspr.fyi/v1/accounts/02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1

```json
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

### Account Balance

This endpoint returns an account's liquid/available balance in CSPR.

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}/balance`

Method: `GET`

Params:
`accountHash` or `publicKey`

e.g. https://api.cspr.fyi/v1/accounts/02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1/balance

```
181.318
```

### Account Address Type

This endpoint returns an address type as one of `Account Hash`,`Delegator Public Key`, `Validator Public Key` or `Unknown`.

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}/type`

Method: `GET`

Params:
`accountHash` or `publicKey`

e.g. https://api.cspr.fyi/v1/accounts/02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1/type

```json
{
  "type": "Account Hash"
}
```

### Account Transfers

This returns both incoming and outgoing transfers that the account has transacted.

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}/transfers?startIndex=1&count=10`

Method: `GET`

Params: `accountHash` or `publicKey`

Query: `startIndex` and `count`.

e.g. https://api.cspr.fyi/v1/accounts/02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1/transfers?startIndex=1&count=10

```json
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

### Account Transactions (Deploys)

This returns an account's transaction/deploys - any thing that is not a transfer.

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}/deploys?startIndex=1&count=10`

Method: `GET`

Params: `accountHash` or `publicKey`

Query: `startIndex` and `count`.

e.g. https://api.cspr.fyi/v1/accounts/02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1/deploys?startIndex=1&count=10

```json
[
 {
    "_id": "633981c00500ba42457112aa",
    "deployHash": "84e62d6e7a1c521afb89e0d6f2d7bc32d428a45df3a0cc25397f2c665f09d9e8",
    "amount": 547690,
    "blockHash": "7636f18caa0398445351389054669a8ff8394b3c053b29f5769d4636c72a2a65",
    "cost": 2.5,
    "deployType": "deploy",
    "entryPoint": "delegate",
    "fromAccountHash": "",
    "publicKey": "02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1",
    "status": "success",
    "timestamp": "2022-10-02T12:17:01.548Z",
    "toAccountHash": "",
    "validator": "0138e64f04c03346e94471e340ca7b94ba3581e5697f4d1e59f5a31c0da720de45",
    "fromAccountBalance": 0,
    "toAccountBalance": 0
  },
  ...
]
```

### Account Delegations

This returns an account's delegations (staking history).

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}/delegations?startIndex=1&count=10`

Method: `GET`

Params: `accountHash` or `publicKey`

Query: `startIndex` and `count`.

e.g. https://api.cspr.fyi/v1/accounts/02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1/delegations?startIndex=1&count=10

```json
[
  {
      "_id": "6332a3ba2aca8bb4a7f9d180",
      "deployHash": "d6e4afc0816a1f7eac1d7728ff996685927eac88b476d6cf2ccee8ff19a42471",
      "amount": 400000,
      "blockHash": "3e42c9c121b25d1bfb357eefe674149aed98cbee7fad7735656c96ffecc88a61",
      "cost": 2.5,
      "deployType": "deploy",
      "entryPoint": "delegate",
      "fromAccountHash": "",
      "publicKey": "02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1",
      "status": "success",
      "timestamp": "2022-06-13T18:14:41.070Z",
      "toAccountHash": "",
      "validator": "015dfd4b3f997b1eb1a7292eb501845931b8aa9869988a5caa2be79ac4f5ff8a21"
  }
  ...
]
```

### Account Undelegations

This returns an account's undelegations (unstaking history).

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}/undelegations?startIndex=1&count=10`

Method: `GET`

Params: `accountHash` or `publicKey`

Query: `startIndex` and `count`.

e.g. https://api.cspr.fyi/v1/accounts/01953cb208d129d3ef3fa8e447a0afac9deb8c0492c89390a26a4b27b30b5808f3/undelegations?startIndex=1&count=10

```json
[
   {
    "_id": "635690da13ecb8fa193d45cd",
    "deployHash": "031d78e6a9a80b75bd41c54857cda418096c7278ad37634ffd1e0a51092d3709",
    "amount": 1063.997472583,
    "blockHash": "93fad11248c270d11e36489ee431bf3cf138be4add71d21297c7084907b0368a",
    "contractHash": "ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea",
    "cost": 0.00001,
    "deployType": "deploy",
    "entryPoint": "undelegate",
    "fromAccountBalance": 0,
    "fromAccountHash": "",
    "publicKey": "01953cb208d129d3ef3fa8e447a0afac9deb8c0492c89390a26a4b27b30b5808f3",
    "status": "success",
    "timestamp": "2022-10-24T12:54:17.684Z",
    "toAccountBalance": 0,
    "toAccountHash": "",
    "validator": "013725fe8df379be1e1cc8c571fc4d21b584dc8bb126000c7ab70db1ed4fb9d751"
  }
  ...
]
```

### Account Daily Rewards

This returns an aggregation of an account's rewards across daily eras.

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}/rewards?startIndex=1&count=10`

Method: `GET`

Params: `accountHash` or `publicKey`

Query: `startIndex` and `count`.

e.g. https://api.cspr.fyi/v1/accounts/02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1/rewards?startIndex=1&count=10

```json
[
  {
    "_id": "2022-10-19",
    "totalReward": 100529.362839798
  },
  ...
]
```

### Account Era Rewards

This returns an aggregation of an account's rewards for the last 1000 eras.

Endpoint: `https://api.cspr.fyi/v1/accounts/{accountHash/publicKey}/era-rewards

Method: `GET`

Params: `accountHash` or `publicKey`

e.g. https://api.cspr.fyi/v1/accounts/02038aaa4b340da663837d4341e4de5f2b475af57f3738914c7c0f44aa6609cbf8b1/era-rewards

```json
[
  {
    "_id": "2022-10-19T19:39:26.592Z",
    "totalReward": 14848.885269659
  },
  ...
]
```

## Blocks

### All Blocks

This returns a blocks sorted in descending order from the latest block added to the chain.

Endpoint: `https://api.cspr.fyi/v1/blocks?startIndex=1207343&count=10`

Method: `GET`

Query: `startIndex` and `count`.

`startIndex` is the block number for which the query begins. It should begin with at most the latest block and is decremented by `count`.

`count` is the represents the number of items in a page.

**NOTE:** Please take note that `startIndex` for this endpoint is inverted.

e.g. https://api.cspr.fyi/v1/blocks?startIndex=1207343&count=10

```json
[
  {
    "_id": "63569e4ba28076da5c9a9877",
    "blockHeight": 1207343,
    "blockHash": "51e557cf0698531414b474906ef049ac08219425b071c34eebbbe04a485df4e0",
    "deploys": 0,
    "eraID": 6850,
    "isSwitchBlock": false,
    "timestamp": "2022-10-24T14:16:21.248Z",
    "transfers": 1,
    "validatorPublicKey": "01ebaebffebe63ee6e35b88697dd9d5bfab23dac47cbd61a45efc8ea8d80ec9c38"
  },
  ...
]
```

### Latest Blocks

This returns a blocks sorted in descending order from the latest block added to the chain.

Endpoint: `https://api.cspr.fyi/v1/blocks/latest/10`

Method: `GET`

Params: `numberOfLatestBlocks`

`numberOfLatestBlocks` is the number of the most recent blocks that you'd like to fetch.

e.g. https://api.cspr.fyi/v1/blocks/latest/10

```json
[
  {
    "_id": "63569e4ba28076da5c9a9877",
    "blockHeight": 1207343,
    "blockHash": "51e557cf0698531414b474906ef049ac08219425b071c34eebbbe04a485df4e0",
    "deploys": 0,
    "eraID": 6850,
    "isSwitchBlock": false,
    "timestamp": "2022-10-24T14:16:21.248Z",
    "transfers": 1,
    "validatorPublicKey": "01ebaebffebe63ee6e35b88697dd9d5bfab23dac47cbd61a45efc8ea8d80ec9c38"
  },
  ...
]
```

### Block Transfers

This returns transfers that were transacted in the block.

Endpoint: `https://api.cspr.fyi/v1/blocks/{blockHash}/transfers`

Method: `GET`

Params: `blockHash`

e.g. https://api.cspr.fyi/v1/blocks/97c01eb4596f6e06891386c181d0530f9dc7cee9fb8fbc57a417788168d16a17/transfers

```json
[
  {
    "_id": "634d2ec127e5a5aa6c70d95e",
    "deployHash": "520e96018e49cb241e8b1178ab4aabbbceb9956f141c88a62bf1ea2eeb645cc1",
    "amount": 10861.083360225,
    "blockHash": "97c01eb4596f6e06891386c181d0530f9dc7cee9fb8fbc57a417788168d16a17",
    "cost": 0.1,
    "deployType": "transfer",
    "entryPoint": "transfer",
    "fromAccountHash": "45f3aa6ce2a450dd5a4f2cc4cc9054aded66de6b6cfc4ad977e7251cf94b649b",
    "publicKey": "02029d865f743f9a67c82c84d443cbd8187bc4a08ca7b4c985f0caca1a4ee98b1f4c",
    "status": "success",
    "timestamp": "2022-09-06T11:22:04.727Z",
    "toAccountHash": "89e3747a7070360c9223de962f8082bd8b071e33e6343b60f8804cf1d065209c",
    "validator": ""
  },
  ...
]
```

## Chain

### Latest Chain State

This returns the chain's latest state

Endpoint: `https://api.cspr.fyi/v1/chain/latest-state`

Method: `GET`

e.g. https://api.cspr.fyi/v1/chain/latest-state

```json
{
  "api_version": "1.4.8",
  "chainspec_name": "casper",
  "starting_state_root_hash": "82b925f7140976f69a85b654e5eb60b8a92826a1e0721661fd78e344f691e3f7",
  "peers": [
    {
      "node_id": "tls:0004..99ad",
      "address": "62.149.222.207:58186"
    },
    ...
  ],
  "last_added_block_info": {
    "hash": "b364d210fd77886bffc2ba66c420270261b54e1090d10e3b6ef52ee1e99eb70a",
    "timestamp": "2022-10-24T15:00:35.456Z",
    "era_id": 6850,
    "height": 1207424,
    "state_root_hash": "896cc41bcf481ccdf89cff43d71ec71d322810a620cc58a42634095d25b05ae1",
    "creator": "01b205c2bd03ce19cd2876ccc21a3566c407b631f3e714532ce0c9956bbac85811"
  },
  "our_public_signing_key": "01676bf10aa61247ea2cc992ce88f72ae0dbddb6c5563fd08e3f5d1d9e8b08d0ad",
  "round_length": null,
  "next_upgrade": null,
  "build_version": "1.4.8-b94c4f79a-casper-mainnet",
  "uptime": "1month 29days 16h 23m 56s 451ms"
}
```

### Stats

This returns an overview (top level stats) of what the network looks like.

Endpoint: `https://api.cspr.fyi/v1/stats`

Method: `GET`

e.g. https://api.cspr.fyi/v1/stats

```json
{
  "currentBlockHeight": 1207430,
  "currentBlockTime": "2022-10-24T15:03:52.064Z",
  "currentPrice": 0.04674432,
  "marketCap": 484851133,
  "circulatingSupply": 10444741752,
  "totalSupply": 11238408059,
  "activeValidators": 103,
  "activeBids": 105,
  "totalStakeBonded": 8616831434.335833,
  "apy": 10.430547015788893,
  "totalTransfers": 562230
}
```