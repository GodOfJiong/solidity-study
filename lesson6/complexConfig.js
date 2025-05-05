const devNetList = ["hardhat", "local"];

let netCfgMap = {};
netCfgMap[Number(process.env.SEPOLIA_ID)] = {
    ccip: ""
}

module.exports = {
    devNetList,
    netCfgMap
}