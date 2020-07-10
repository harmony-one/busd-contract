require('dotenv').config()

let chain, endpoint
switch(process.env.NETWORK){
    case 'localnet': {
        chain = 2;
        switch(process.env.SHARD) {
            case 0:
                endpoint = 'http://localhost:9500'
                break;
            case 1:
                endpoint = 'http://localhost:9501'
                break;
        }
        break;
    }
    case 'testnet': {
        chain = 2;
        endpoint = 'https://api.s' + process.env.SHARD + '.b.hmny.io'
        break;
    }
    case 'mainnet': {
        chain = 1;
        endpoint = 'https://api.s' + process.env.SHARD + '.t.hmny.io'
        break;
    }
}

module.exports = {
    port: 3000, // Port for Express app
    privateKey: process.env.PRIVATE_KEY,
    mnemonic: process.env.MNEMONIC,
    ENV: process.env.ENV,
    chain,
    endpoint,
}

/*
Sample .env file

// Which network to connect to (mainnet, testnet, or localnet)?
NETWORK='testnet'

// Smart contract deployment shard
SHARD=0

// Sender wallet details (only 1 required)
PRIVATE_KEY=
MNEMONIC=
 */