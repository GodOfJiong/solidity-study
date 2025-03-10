const devNetList = ["hardhat", "local"];

let netCfgMap = {};
netCfgMap[Number(process.env.SEPOLIA_ID)] = {
    dataFeed: {
        usdPerEth: process.env.SEPOLIA_USD_PER_ETH
    }
}

module.exports = {
    devNetList,
    netCfgMap
}