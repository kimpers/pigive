const path = require("path");
require("babel-register");
require("babel-polyfill");

const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = process.env.MNEMONIC;
const infuraKey = process.env.INFURA_KEY;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => {
        if (!mnemonic) {
          throw new Error("MNEMONIC env variable missing");
        }

        if (!infuraKey) {
          throw new Error("INFURA_KEY env variable missing");
        }

        return new HDWalletProvider(
          mnemonic,
          `https://rinkeby.infura.io/${infuraKey}`
        );
      },
      network_id: 4,
      gas: 4612388
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
