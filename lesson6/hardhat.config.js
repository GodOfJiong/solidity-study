require("dotenv").config();
require("@chainlink/env-enc").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      chainId: Number(process.env.SEPOLIA_ID),
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.TEST_ACCOUNT_1]
    },
    amoy: {
      chainId: Number(process.env.AMOY_ID),
      url: process.env.AMOY_URL,
      accounts: [process.env.TEST_ACCOUNT_1]
    }
  },
  namedAccounts: {
    testAccount1: {
      default: 0
    }
  }
};
