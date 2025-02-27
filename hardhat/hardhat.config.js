require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.TEST_ACCOUNT_1]
    }
  }
};
