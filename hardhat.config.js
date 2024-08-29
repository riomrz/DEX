/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });


module.exports = {
  paths: {
    sources: 'contracts',
  },
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_URL,
        // blockNumber: 15000000 // Change accordingly
      },
    },
    dashboard: {
      url: 'http://localhost:24012/rpc'
    },
    /* amoy: {
      chainId: 80002,
      url: `${process.env.AMOY_PROVIDER}`,
      accounts: [`${process.env.AMOY_PRIVATE_KEY}`],
      confirmations: 2,
      skipDryRun: true,
      urls: {
        apiURL: 'https://api-amoy.plygonscan.com/api',
        browserURL: 'https://amoy.polygonscan.com'
      }
    } */
  },

  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
};
