
/********************************
Previous Config
********************************/
// var HDWalletProvider = require("truffle-hdwallet-provider");
// const mnemonic = "";
// const walletChildNum = 0;
// const networkAddress = "https://mainnet.infura.io/v3/<your-api-key>";

require('dotenv').config()
const { TruffleProvider } = require('@harmony-js/core')
//Local
const local_mnemonic = process.env.LOCAL_MNEMONIC
const local_private_key = process.env.LOCAL_PRIVATE_KEY
const local_url = process.env.LOCAL_0_URL;
//Testnet
const testnet_mnemonic = process.env.TESTNET_MNEMONIC
const testnet_private_key = process.env.TESTNET_PRIVATE_KEY
const testnet_url = process.env.TESTNET_0_URL
//Mainnet
const mainnet_mnemonic = process.env.MAINNET_MNEMONIC
const mainnet_private_key = process.env.MAINNET_PRIVATE_KEY
const mainnet_url = process.env.MAINNET_0_URL;
//Gas
const gasLimit = process.env.GAS_LIMIT
const gasPrice = process.env.GAS_PRICE

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {

    local: {
      network_id: '2', 
      provider: () => {
        const truffleProvider = new TruffleProvider(
          local_url,
          { memonic: local_mnemonic },
          { shardID: 0, chainId: 2 },
          { gasLimit: gasLimit, gasPrice: gasPrice},
        );
        const newAcc = truffleProvider.addByPrivateKey(local_private_key);
        truffleProvider.setSigner(newAcc);
        return truffleProvider;
      },
    },
    testnet: {
      network_id: '2', 
      provider: () => {
        const truffleProvider = new TruffleProvider(
          testnet_url,
          { memonic: testnet_mnemonic },
          { shardID: 0, chainId: 2 },
          { gasLimit: gasLimit, gasPrice: gasPrice},
        );
        const newAcc = truffleProvider.addByPrivateKey(testnet_private_key);
        console.log(newAcc)
        truffleProvider.setSigner(newAcc);
        return truffleProvider;
      },
    },
    mainnet0: {
      network_id: '1', 
      provider: () => {
        const truffleProvider = new TruffleProvider(
          mainnet_url,
          { memonic: mainnet_mnemonic },
          { shardID: 0, chainId: 1 },
          { gasLimit: gasLimit, gasPrice: gasPrice },
        );
        const newAcc = truffleProvider.addByPrivateKey(mainnet_private_key);
        truffleProvider.setSigner(newAcc);
        return truffleProvider;
      },
    },

    /********************************
    Truffle tests will default to using built in Ganache
    ********************************/
    // development: {
    //   host: '127.0.0.1',
    //   port: 8545, // ganache-cli
    //   network_id: '*', // Match any network id
    //   gas: 6700000,
    //   gasPrice: 0x01
    // },
    // coverage: {
    //   host: 'localhost',
    //   network_id: '*',
    //   port: 8321,
    //   gas: 10000000000000,
    //   gasPrice: 0x01
    // },
    /********************************
    Previous Mainnet config
    ********************************/
    // mainnet: {
    //   network_id: 1,
    //   provider: function () {
    //     return new HDWalletProvider(mnemonic, networkAddress, walletChildNum)
    //   },
    // },
  },
  compilers: {
    solc: {
      version: "v0.4.24+commit.e67f0147"  // ex:  "0.4.20". (Default: Truffle's installed solc)
      // version: "0.5.8",
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
