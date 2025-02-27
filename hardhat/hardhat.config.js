require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/oc_isVT1GRDemrNJqLQBawc2TbHLuZ2n",
      accounts: ["a074405f4c8a648d25ffe73d10a6ce0f09d05be8c37bc6d4d5c0c581a32ba386"]
    }
  }
};
