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

## Contracts

### All Contracts

This returns a list of all contracts in the chain.

Endpoint: `https://api.cspr.fyi/v1/contracts`

Method: `GET`

e.g. https://api.cspr.fyi/v1/contracts

```json
[
  {
    "_id": "634f98efae1e598026ac1ede",
    "contractHash": "ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea",
    "contractPackageHash": "86f2d45f024d7bb7fb5266b2390d7c253b588a0a16ebd946a60cb4314600af74",
    "contractPackage": {
      "accessKey": "uref-be3a9a586b10eba01dc1392bcef73139ea2482be3af469eca12c5ae91a7ed6b4-007",
      "versions": [
        {
          "protocolVersionMajor": 1,
          "contractVersion": 1,
          "contractHash": "contract-ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea"
        },
        {
          "protocolVersionMajor": 1,
          "contractVersion": 2,
          "contractHash": "contract-ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea"
        }
      ],
      "disabledVersions": [
        {
          "accessKey": 1,
          "contractVersion": 1
        }
      ],
      "groups": []
    },
    "contractWasmHash": "fab3d56479eaa20e8e1e7e6c03fca6b8a8424e0d0a24505d3a5edd6f01da61ff",
    "entryPoints": [
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "activate_bid",
        "ret": "Unit",
        "args": [
          {
            "name": "validator_public_key",
            "clType": "PublicKey"
          }
        ]
      },
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "add_bid",
        "ret": "U512",
        "args": [
          {
            "name": "public_key",
            "clType": "PublicKey"
          },
          {
            "name": "delegation_rate",
            "clType": "U8"
          },
          {
            "name": "amount",
            "clType": "U512"
          }
        ]
      },
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "delegate",
        "ret": "U512",
        "args": [
          {
            "name": "delegator",
            "clType": "PublicKey"
          },
          {
            "name": "validator",
            "clType": "PublicKey"
          },
          {
            "name": "amount",
            "clType": "U512"
          }
        ]
      },
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "distribute",
        "ret": "Unit",
        "args": [
          {
            "name": "reward_factors",
            "clType": {
              "Map": {
                "key": "PublicKey",
                "value": "U64"
              }
            }
          }
        ]
      },
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "get_era_validators",
        "ret": {
          "Option": {
            "Map": {
              "key": "PublicKey",
              "value": "U512"
            }
          }
        },
        "args": []
      },
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "read_era_id",
        "ret": "U64",
        "args": []
      },
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "run_auction",
        "ret": "Unit",
        "args": [
          {
            "name": "era_end_timestamp_millis",
            "clType": "U64"
          }
        ]
      },
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "slash",
        "ret": "Unit",
        "args": []
      },
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "undelegate",
        "ret": "U512",
        "args": [
          {
            "name": "delegator",
            "clType": "PublicKey"
          },
          {
            "name": "validator",
            "clType": "PublicKey"
          },
          {
            "name": "amount",
            "clType": "U512"
          }
        ]
      },
      {
        "access": "Public",
        "entryPointType": "Contract",
        "name": "withdraw_bid",
        "ret": "U512",
        "args": [
          {
            "name": "public_key",
            "clType": "PublicKey"
          },
          {
            "name": "amount",
            "clType": "U512"
          }
        ]
      }
    ],
    "namedKeys": [
      {
        "name": "auction_delay",
        "key": "uref-928427e4ab2781ed13672499fffc1a3cc92a56a811c91c5dbf2ef8e508d07da8-007"
      },
      {
        "name": "era_end_timestamp_millis",
        "key": "uref-0061a68c3aa40357de889ce1b6685263496b7feb6932628e423bfa9f212c19d7-007"
      },
      {
        "name": "era_id",
        "key": "uref-f7330251e20a9d288a77353157f57f8b3f68d2249444b4b3b87d807be499207d-007"
      },
      {
        "name": "locked_funds_period",
        "key": "uref-1bf5b0d8bbf6a276482b104f0b1c520b2ef79d997e9e85a97ee911be39c50c0e-007"
      },
      {
        "name": "seigniorage_recipients_snapshot",
        "key": "uref-84f5ed5c5ec2de4cd4172149b0a9d97836dd1ecd793d5ebf4651c2eb4e54c129-007"
      },
      {
        "name": "unbonding_delay",
        "key": "uref-0ca3106ef95f578d07d9d55f5e0a2e973d5e8f6f9404c0a9ce30f5743b6173c5-007"
      },
      {
        "name": "validator_slots",
        "key": "uref-e24d4f4639e042dc22ed3841625c92ad9b0793e1d1e6e9050f41b6f80736d995-007"
      }
    ],
    "protocolVersion": "1.4.5",
    "deploys": 1435
  },
  ...
]
```

### Contract Details

This returns the details of a contract and contract package as well as raw contract or contract package data depending on the hash passed.

Endpoint: `https://api.cspr.fyi/v1/contracts/{contractHash/contractPackageHash}`

Method: `GET`

Params: `contractHash` or `contractPackageHash`

e.g. https://api.cspr.fyi/v1/contracts/86f2d45f024d7bb7fb5266b2390d7c253b588a0a16ebd946a60cb4314600af74

```json
{
  "_id": "634f98efae1e598026ac1ede",
  "contractHash": "ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea",
  "contractPackageHash": "86f2d45f024d7bb7fb5266b2390d7c253b588a0a16ebd946a60cb4314600af74",
  "contractPackage": {
    "accessKey": "uref-be3a9a586b10eba01dc1392bcef73139ea2482be3af469eca12c5ae91a7ed6b4-007",
    "versions": [
      {
        "protocolVersionMajor": 1,
        "contractVersion": 1,
        "contractHash": "contract-ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea"
      },
      {
        "protocolVersionMajor": 1,
        "contractVersion": 2,
        "contractHash": "contract-ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea"
      }
    ],
    "disabledVersions": [
      {
        "accessKey": 1,
        "contractVersion": 1
      }
    ],
    "groups": []
  },
  "contractWasmHash": "fab3d56479eaa20e8e1e7e6c03fca6b8a8424e0d0a24505d3a5edd6f01da61ff",
  "entryPoints": [
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "activate_bid",
      "ret": "Unit",
      "args": [
        {
          "name": "validator_public_key",
          "clType": "PublicKey"
        }
      ]
    },
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "add_bid",
      "ret": "U512",
      "args": [
        {
          "name": "public_key",
          "clType": "PublicKey"
        },
        {
          "name": "delegation_rate",
          "clType": "U8"
        },
        {
          "name": "amount",
          "clType": "U512"
        }
      ]
    },
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "delegate",
      "ret": "U512",
      "args": [
        {
          "name": "delegator",
          "clType": "PublicKey"
        },
        {
          "name": "validator",
          "clType": "PublicKey"
        },
        {
          "name": "amount",
          "clType": "U512"
        }
      ]
    },
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "distribute",
      "ret": "Unit",
      "args": [
        {
          "name": "reward_factors",
          "clType": {
            "Map": {
              "key": "PublicKey",
              "value": "U64"
            }
          }
        }
      ]
    },
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "get_era_validators",
      "ret": {
        "Option": {
          "Map": {
            "key": "PublicKey",
            "value": "U512"
          }
        }
      },
      "args": []
    },
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "read_era_id",
      "ret": "U64",
      "args": []
    },
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "run_auction",
      "ret": "Unit",
      "args": [
        {
          "name": "era_end_timestamp_millis",
          "clType": "U64"
        }
      ]
    },
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "slash",
      "ret": "Unit",
      "args": []
    },
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "undelegate",
      "ret": "U512",
      "args": [
        {
          "name": "delegator",
          "clType": "PublicKey"
        },
        {
          "name": "validator",
          "clType": "PublicKey"
        },
        {
          "name": "amount",
          "clType": "U512"
        }
      ]
    },
    {
      "access": "Public",
      "entryPointType": "Contract",
      "name": "withdraw_bid",
      "ret": "U512",
      "args": [
        {
          "name": "public_key",
          "clType": "PublicKey"
        },
        {
          "name": "amount",
          "clType": "U512"
        }
      ]
    }
  ],
  "namedKeys": [
    {
      "name": "auction_delay",
      "key": "uref-928427e4ab2781ed13672499fffc1a3cc92a56a811c91c5dbf2ef8e508d07da8-007"
    },
    {
      "name": "era_end_timestamp_millis",
      "key": "uref-0061a68c3aa40357de889ce1b6685263496b7feb6932628e423bfa9f212c19d7-007"
    },
    {
      "name": "era_id",
      "key": "uref-f7330251e20a9d288a77353157f57f8b3f68d2249444b4b3b87d807be499207d-007"
    },
    {
      "name": "locked_funds_period",
      "key": "uref-1bf5b0d8bbf6a276482b104f0b1c520b2ef79d997e9e85a97ee911be39c50c0e-007"
    },
    {
      "name": "seigniorage_recipients_snapshot",
      "key": "uref-84f5ed5c5ec2de4cd4172149b0a9d97836dd1ecd793d5ebf4651c2eb4e54c129-007"
    },
    {
      "name": "unbonding_delay",
      "key": "uref-0ca3106ef95f578d07d9d55f5e0a2e973d5e8f6f9404c0a9ce30f5743b6173c5-007"
    },
    {
      "name": "validator_slots",
      "key": "uref-e24d4f4639e042dc22ed3841625c92ad9b0793e1d1e6e9050f41b6f80736d995-007"
    }
  ],
  "protocolVersion": "1.4.5",
  "rawData": {
    "ContractPackage": {
      "access_key": "uref-be3a9a586b10eba01dc1392bcef73139ea2482be3af469eca12c5ae91a7ed6b4-007",
      "versions": [
        {
          "protocol_version_major": 1,
          "contract_version": 1,
          "contract_hash": "contract-ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea"
        },
        {
          "protocol_version_major": 1,
          "contract_version": 2,
          "contract_hash": "contract-ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea"
        }
      ],
      "disabled_versions": [
        {
          "protocol_version_major": 1,
          "contract_version": 1
        }
      ],
      "groups": []
    }
  }
}
```

### Contract Transactions (Deploys)

This returns a list of deploys where the contract was called.

Endpoint: `https://api.cspr.fyi/v1/contracts/{contractHash/contractPackageHash}/deploys?startIndex=1&count=10`

Method: `GET`

Params: `contractHash` or `contractPackageHash`

Query: `startIndex` and `count`.

e.g. https://api.cspr.fyi/v1/contracts/86f2d45f024d7bb7fb5266b2390d7c253b588a0a16ebd946a60cb4314600af74/deploys?startIndex=1&count=10

```json
[
  {
    "_id": "6356a67da28076da5c9bceb9",
    "deployHash": "09511411fc659cbbb0ee0878d15430aa5c8bc3e7730efbab9a58104fc42b2319",
    "amount": 10400,
    "blockHash": "a81d9e5407adcf49f7d4b7183be203c7f48a2944fe750b55ba9a456d08e82694",
    "contractHash": "ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea",
    "cost": 2.5,
    "deployType": "deploy",
    "entryPoint": "delegate",
    "fromAccountBalance": 0,
    "fromAccountHash": "",
    "publicKey": "0141af94462f6c05208755ba55bc42688eadf20e50076901808a40a66fbf51b05a",
    "status": "success",
    "timestamp": "2022-10-24T14:50:06.801Z",
    "toAccountBalance": 0,
    "toAccountHash": "",
    "validator": "0167e08c3b05017d329444dc7d22518ba652cecb2c54669a69e5808ebcab25e42c"
  },
  ...
]
```

### Uref

This returns urefs raw data from the chain.

Endpoint: `https://api.cspr.fyi/v1/contracts/uref/{uref}

Method: `GET`

Params: `uref`

e.g. https://api.cspr.fyi/v1/contracts/uref/uref-857cff86f3f15734787bcb63fc6445ff940f18bdb4348fe514d3c06efbbe4a0f-007

```json
{
  "CLValue": {
    "cl_type": {
      "List": "Key"
    },
    "bytes": "03000000019431cafe98ca1ef6e3e53cadba95c719bfbfb25d6bebf76b79e9373afbd1c1b10198eebe77fc76b51f39968deb805ebeaecdb577295ea3701c5b89e47ceb237409018d671ac222f169d957757e33756a3fec2e13ec93ec8a7caf6472da5d543a59f8",
    "parsed": [
      {
        "Hash": "hash-9431cafe98ca1ef6e3e53cadba95c719bfbfb25d6bebf76b79e9373afbd1c1b1"
      },
      {
        "Hash": "hash-98eebe77fc76b51f39968deb805ebeaecdb577295ea3701c5b89e47ceb237409"
      },
      {
        "Hash": "hash-8d671ac222f169d957757e33756a3fec2e13ec93ec8a7caf6472da5d543a59f8"
      }
    ]
  }
}
```

## Deploys

### All Deploys

This returns a list of all deploys in the chain sort by timestamp in descending order.

Endpoint: `https://api.cspr.fyi/v1/deploys?startIndex=1&count=10`

Method: `GET`

Query: `startIndex` and `count`.

e.g. https://api.cspr.fyi/v1/deploys?startIndex=1&count=10

```json
[
  {
    "_id": "633353e72aca8bb4a7275e8d",
    "deployHash": "d3844eb80985e0ed71e607947181ed5a9bc16322b4a51d2c8f9880f8be9c386c",
    "amount": 3710.355,
    "blockHash": "d1e7b426adf2fa4a3b68f82010c0b3f661718628f989ba04044eb6ab8ece6201",
    "cost": 2.70344316,
    "deployType": "deploy",
    "entryPoint": "unlock cspr",
    "fromAccountHash": "",
    "publicKey": "016a6339f34d4ec62f60f20dd7295b5b7872cd7c59a430320aab5baa823e1f524c",
    "status": "fail",
    "timestamp": "2022-09-22T11:02:04.661Z",
    "toAccountHash": "",
    "validator": ""
  },
  ...
]
```

### Deploy Details

This returns a deploys raw data.

Endpoint: `https://api.cspr.fyi/v1/deploys/{deployHash}`

Method: `GET`

Params: `deployHash`

e.g. https://api.cspr.fyi/v1/deploys/1ad50e305bf23db7b6c06ea726e4f38afdb05e93f692913084fb2f9b8d5520e3

```json
{
  "api_version": "1.4.8",
  "deploy": {
    "hash": "1ad50e305bf23db7b6c06ea726e4f38afdb05e93f692913084fb2f9b8d5520e3",
    "header": {
      "account": "0203f3f44c9e80e2cedc1a2909631a3adea8866ee32187f74d0912387359b0ff36a2",
      "timestamp": "2022-10-24T16:04:07.037Z",
      "ttl": "30m",
      "gas_price": 1,
      "body_hash": "4e5c7a0c5e590ffaf4d1402f759025ef00acfb08e8c0d799a9637a02b91e2858",
      "dependencies": [],
      "chain_name": "casper"
    },
    "payment": {
      "ModuleBytes": {
        "module_bytes": "",
        "args": [
          [
            "amount",
            {
              "cl_type": "U512",
              "bytes": "0400e1f505",
              "parsed": "100000000"
            }
          ]
        ]
      }
    },
    "session": {
      "Transfer": {
        "args": [
          [
            "amount",
            {
              "cl_type": "U512",
              "bytes": "06007e2638e222",
              "parsed": "38355000000000"
            }
          ],
          [
            "target",
            {
              "cl_type": {
                "ByteArray": 32
              },
              "bytes": "a885f7d4312e8f766de13594ed459da5f4d04872b69843ef86848aa345d289f9",
              "parsed": "a885f7d4312e8f766de13594ed459da5f4d04872b69843ef86848aa345d289f9"
            }
          ],
          [
            "id",
            {
              "cl_type": {
                "Option": "U64"
              },
              "bytes": "010100000000000000",
              "parsed": 1
            }
          ]
        ]
      }
    },
    "approvals": [
      {
        "signer": "0203f3f44c9e80e2cedc1a2909631a3adea8866ee32187f74d0912387359b0ff36a2",
        "signature": "02db57c744435e5270ef302b1a7e4f87b66e934a0414372858d75b39921f157ed6043368fd2f1feda66906dc9d7c28cc84f346e3d7cff7bb2e651f0ebfd80207e1"
      }
    ]
  },
  "execution_results": [
    {
      "block_hash": "7036af0509ee06d09a0846a7e0b20e3b21b599673b70ad40f2583426a4f68025",
      "result": {
        "Success": {
          "effect": {
            "operations": [],
            "transforms": [
              {
                "key": "account-hash-a885f7d4312e8f766de13594ed459da5f4d04872b69843ef86848aa345d289f9",
                "transform": "Identity"
              },
              {
                "key": "account-hash-a885f7d4312e8f766de13594ed459da5f4d04872b69843ef86848aa345d289f9",
                "transform": "Identity"
              },
              {
                "key": "hash-d2469afeb99130f0be7c9ce230a84149e6d756e306ef8cf5b8a49d5182e41676",
                "transform": "Identity"
              },
              {
                "key": "hash-d63c44078a1931b5dc4b80a7a0ec586164fd0470ce9f8b23f6d93b9e86c5944d",
                "transform": "Identity"
              },
              {
                "key": "hash-7cc1b1db4e08bbfe7bacf8e1ad828a5d9bcccbb33e55d322808c3a88da53213a",
                "transform": "Identity"
              },
              {
                "key": "hash-4475016098705466254edd18d267a9dad43e341d4dafadb507d0fe3cf2d4a74b",
                "transform": "Identity"
              },
              {
                "key": "balance-7950bf87377371651e0927198e2bc73074a43a804037cc4e20f4a2c21115b7ef",
                "transform": "Identity"
              },
              {
                "key": "balance-fe327f9815a1d016e1143db85e25a86341883949fd75ac1c1e7408a26c5b62ef",
                "transform": "Identity"
              },
              {
                "key": "balance-7950bf87377371651e0927198e2bc73074a43a804037cc4e20f4a2c21115b7ef",
                "transform": {
                  "WriteCLValue": {
                    "cl_type": "U512",
                    "bytes": "088eeed6f50ee75204",
                    "parsed": "311565375682047630"
                  }
                }
              },
              {
                "key": "balance-fe327f9815a1d016e1143db85e25a86341883949fd75ac1c1e7408a26c5b62ef",
                "transform": {
                  "AddUInt512": "100000000"
                }
              },
              {
                "key": "account-hash-a885f7d4312e8f766de13594ed459da5f4d04872b69843ef86848aa345d289f9",
                "transform": "Identity"
              },
              {
                "key": "account-hash-a885f7d4312e8f766de13594ed459da5f4d04872b69843ef86848aa345d289f9",
                "transform": "Identity"
              },
              {
                "key": "hash-d2469afeb99130f0be7c9ce230a84149e6d756e306ef8cf5b8a49d5182e41676",
                "transform": "Identity"
              },
              {
                "key": "hash-d63c44078a1931b5dc4b80a7a0ec586164fd0470ce9f8b23f6d93b9e86c5944d",
                "transform": "Identity"
              },
              {
                "key": "hash-7cc1b1db4e08bbfe7bacf8e1ad828a5d9bcccbb33e55d322808c3a88da53213a",
                "transform": "Identity"
              },
              {
                "key": "hash-4475016098705466254edd18d267a9dad43e341d4dafadb507d0fe3cf2d4a74b",
                "transform": "Identity"
              },
              {
                "key": "balance-7950bf87377371651e0927198e2bc73074a43a804037cc4e20f4a2c21115b7ef",
                "transform": "Identity"
              },
              {
                "key": "balance-fe327f9815a1d016e1143db85e25a86341883949fd75ac1c1e7408a26c5b62ef",
                "transform": "Identity"
              },
              {
                "key": "balance-7950bf87377371651e0927198e2bc73074a43a804037cc4e20f4a2c21115b7ef",
                "transform": {
                  "WriteCLValue": {
                    "cl_type": "U512",
                    "bytes": "088eeed6f50ee75204",
                    "parsed": "311565375682047630"
                  }
                }
              },
              {
                "key": "balance-fe327f9815a1d016e1143db85e25a86341883949fd75ac1c1e7408a26c5b62ef",
                "transform": {
                  "AddUInt512": "100000000"
                }
              },
              {
                "key": "hash-7cc1b1db4e08bbfe7bacf8e1ad828a5d9bcccbb33e55d322808c3a88da53213a",
                "transform": "Identity"
              },
              {
                "key": "hash-4475016098705466254edd18d267a9dad43e341d4dafadb507d0fe3cf2d4a74b",
                "transform": "Identity"
              },
              {
                "key": "balance-7950bf87377371651e0927198e2bc73074a43a804037cc4e20f4a2c21115b7ef",
                "transform": "Identity"
              },
              {
                "key": "balance-86f432aacc285acb9e8c596ccf5bc858b1d4e61089eda1ed7684532f35dd1452",
                "transform": "Identity"
              },
              {
                "key": "balance-7950bf87377371651e0927198e2bc73074a43a804037cc4e20f4a2c21115b7ef",
                "transform": {
                  "WriteCLValue": {
                    "cl_type": "U512",
                    "bytes": "088e70b0bd2cc45204",
                    "parsed": "311527020682047630"
                  }
                }
              },
              {
                "key": "balance-86f432aacc285acb9e8c596ccf5bc858b1d4e61089eda1ed7684532f35dd1452",
                "transform": {
                  "AddUInt512": "38355000000000"
                }
              },
              {
                "key": "transfer-0c27351140de9f1a401a7932d76f060e873c4e12f09102bc9884e46729cc4c5a",
                "transform": {
                  "WriteTransfer": {
                    "deploy_hash": "1ad50e305bf23db7b6c06ea726e4f38afdb05e93f692913084fb2f9b8d5520e3",
                    "from": "account-hash-496d542527e1a29f576ab7c3f4c947bfcdc9b4145f75f6ec40e36089432d7351",
                    "to": "account-hash-a885f7d4312e8f766de13594ed459da5f4d04872b69843ef86848aa345d289f9",
                    "source": "uref-7950bf87377371651e0927198e2bc73074a43a804037cc4e20f4a2c21115b7ef-007",
                    "target": "uref-86f432aacc285acb9e8c596ccf5bc858b1d4e61089eda1ed7684532f35dd1452-004",
                    "amount": "38355000000000",
                    "gas": "0",
                    "id": 1
                  }
                }
              },
              {
                "key": "deploy-1ad50e305bf23db7b6c06ea726e4f38afdb05e93f692913084fb2f9b8d5520e3",
                "transform": {
                  "WriteDeployInfo": {
                    "deploy_hash": "1ad50e305bf23db7b6c06ea726e4f38afdb05e93f692913084fb2f9b8d5520e3",
                    "transfers": [
                      "transfer-0c27351140de9f1a401a7932d76f060e873c4e12f09102bc9884e46729cc4c5a"
                    ],
                    "from": "account-hash-496d542527e1a29f576ab7c3f4c947bfcdc9b4145f75f6ec40e36089432d7351",
                    "source": "uref-7950bf87377371651e0927198e2bc73074a43a804037cc4e20f4a2c21115b7ef-007",
                    "gas": "100000000"
                  }
                }
              },
              {
                "key": "hash-d2469afeb99130f0be7c9ce230a84149e6d756e306ef8cf5b8a49d5182e41676",
                "transform": "Identity"
              },
              {
                "key": "hash-d63c44078a1931b5dc4b80a7a0ec586164fd0470ce9f8b23f6d93b9e86c5944d",
                "transform": "Identity"
              },
              {
                "key": "balance-fe327f9815a1d016e1143db85e25a86341883949fd75ac1c1e7408a26c5b62ef",
                "transform": "Identity"
              },
              {
                "key": "hash-d2469afeb99130f0be7c9ce230a84149e6d756e306ef8cf5b8a49d5182e41676",
                "transform": "Identity"
              },
              {
                "key": "hash-7cc1b1db4e08bbfe7bacf8e1ad828a5d9bcccbb33e55d322808c3a88da53213a",
                "transform": "Identity"
              },
              {
                "key": "hash-4475016098705466254edd18d267a9dad43e341d4dafadb507d0fe3cf2d4a74b",
                "transform": "Identity"
              },
              {
                "key": "balance-fe327f9815a1d016e1143db85e25a86341883949fd75ac1c1e7408a26c5b62ef",
                "transform": "Identity"
              },
              {
                "key": "balance-80317247d4b533d23c473cb8e022c650735b6e93bc2ed6289e2aba88f82d893c",
                "transform": "Identity"
              },
              {
                "key": "balance-fe327f9815a1d016e1143db85e25a86341883949fd75ac1c1e7408a26c5b62ef",
                "transform": {
                  "WriteCLValue": {
                    "cl_type": "U512",
                    "bytes": "00",
                    "parsed": "0"
                  }
                }
              },
              {
                "key": "balance-80317247d4b533d23c473cb8e022c650735b6e93bc2ed6289e2aba88f82d893c",
                "transform": {
                  "AddUInt512": "100000000"
                }
              }
            ]
          },
          "transfers": [
            "transfer-0c27351140de9f1a401a7932d76f060e873c4e12f09102bc9884e46729cc4c5a"
          ],
          "cost": "100000000"
        }
      }
    }
  ]
}
```

### Deploy volumes

This returns an aggregation of daily deploy volumes per day for a specified number of days, as well as the total number of deploys.

Endpoint: `https://api.cspr.fyi/v1/deploys/volumes/{numberOfDays}`

Method: `GET`

Params: `numberOfDays`

`numberOfDays` is the number of the days for the volumes are fetched.

e.g. https://api.cspr.fyi/v1/deploys/volumes/14

```json
{
  "volumes": [
    {
      "_id": "2022-10-23",
      "volume": 742
    },
    ...
  ],
  "totalDeploys": 708795
}
```

## Validators

### All Bids

This returns a list of all bids.

Endpoint: `https://api.cspr.fyi/v1/validators/bids`

Method: `GET`

e.g. https://api.cspr.fyi/v1/validators/bids

```json
[
  {
    "_id": "63398d8ce171002c64c53623",
    "publicKey": "015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72",
    "performance": 0.7305555555555555,
    "totalDelegatorRewards": 1629097328.1280763,
    "totalValidatorRewards": 195660320.34688172,
    "delegationRate": 10,
    "inactive": false,
    "networkPercentage": 8.000482747061668,
    "numOfDelegators": 119,
    "rank": 1,
    "selfStake": 639184.840896486,
    "selfStakePercentage": 0.09296362674241634,
    "totalBid": 687564441.3782818,
    "totalDelegated": 686925256.5373853
  },
  ...
]
```

### All Current Era Validators

This returns a list of all current era validators.

Endpoint: `https://api.cspr.fyi/v1/validators/current-era`

Method: `GET`

e.g. https://api.cspr.fyi/v1/validators/current-era

```json
[
  {
    "_id": "63398d8ce171002c64c53623",
    "publicKey": "015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72",
    "performance": 0.7305555555555555,
    "totalDelegatorRewards": 1629097328.1280763,
    "totalValidatorRewards": 195660320.34688172,
    "delegationRate": 10,
    "inactive": false,
    "networkPercentage": 8.000482747061668,
    "numOfDelegators": 119,
    "rank": 1,
    "selfStake": 639184.840896486,
    "selfStakePercentage": 0.09296362674241634,
    "totalBid": 687564441.3782818,
    "totalDelegated": 686925256.5373853
  },
  ...
]
```

### All Next Era Validators

This returns a list of all next era validators.

Endpoint: `https://api.cspr.fyi/v1/validators/next-era`

Method: `GET`

e.g. https://api.cspr.fyi/v1/validators/next-era

```json
[
  {
    "_id": "63398d8ce171002c64c53623",
    "publicKey": "015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72",
    "performance": 0.7305555555555555,
    "totalDelegatorRewards": 1629097328.1280763,
    "totalValidatorRewards": 195660320.34688172,
    "delegationRate": 10,
    "inactive": false,
    "networkPercentage": 8.000482747061668,
    "numOfDelegators": 119,
    "rank": 1,
    "selfStake": 639184.840896486,
    "selfStakePercentage": 0.09296362674241634,
    "totalBid": 687564441.3782818,
    "totalDelegated": 686925256.5373853
  },
  ...
]
```

### Validator Details

This returns a validator's details.

Endpoint: `https://api.cspr.fyi/v1/validators/{validatorPublicKey}`

Method: `GET`

Params: `validatorPublicKey`

e.g. https://api.cspr.fyi/v1/validators/015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72

```json
{
  "_id": "63398d8ce171002c64c53623",
  "publicKey": "015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72",
  "performance": 0.7305555555555555,
  "totalDelegatorRewards": 1629097328.1280763,
  "totalValidatorRewards": 195660320.34688172,
  "delegationRate": 10,
  "inactive": false,
  "networkPercentage": 8.000482747061668,
  "numOfDelegators": 119,
  "rank": 1,
  "selfStake": 639184.840896486,
  "selfStakePercentage": 0.09296362674241634,
  "totalBid": 687564441.3782818,
  "totalDelegated": 686925256.5373853
}
```

### Validator Delegators

This returns a list of validator's delegators

Endpoint: `https://api.cspr.fyi/v1/validators/{validatorPublicKey}/delegators`

Method: `GET`

Params: `validatorPublicKey`

e.g. https://api.cspr.fyi/v1/validators/015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72/delegators

```json
[
  {
    "_id": "633aa7e3bfe93c554fa97ee5",
    "publicKey": "01a0d23e084a95cdee9c2fb226d54033d645873a7c7c9739de2158725c7dfe672f",
    "validatorPublicKey": "015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72",
    "__v": 0,
    "bondingPurse": "uref-96146807746aea13738c20e666636eceb9f4f1bf1ab54ddbf3554d277412f388-007",
    "delegatee": "015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72",
    "stakedAmount": 351199069.50583285
  },
  ...
]
```

### Validator Blocks

This returns a list of blocks proposed by the validator

Endpoint: `https://api.cspr.fyi/v1/blocks/validator-blocks/{validatorPublicKey}?startIndex=1&count=10`

Method: `GET`

Params: `validatorPublicKey`

Query: `startIndex` and `count`.

e.g. https://api.cspr.fyi/v1/blocks/validator-blocks/015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72?startIndex=1&count=10

```json
[
   {
    "_id": "6356bf72a28076da5c9eb04d",
    "blockHeight": 1207602,
    "blockHash": "ea2ff8523773cc25c6a6bef0420d0921494d8f58995246011425e95e21d89481",
    "deploys": 0,
    "eraID": 6851,
    "isSwitchBlock": false,
    "timestamp": "2022-10-24T16:37:48.160Z",
    "transfers": 0,
    "validatorPublicKey": "015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72"
  },
  ...
]
```
