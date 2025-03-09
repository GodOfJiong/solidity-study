const devNetList = ["hardhat", "local"];

let netCfgMap = {};
netCfgMap[Number(process.env.SEPOLIA_ID)] = {
    dataFeed: {
        usdPerEth: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
}

module.exports = {
    devNetList,
    netCfgMap
}