const devNetList = ["hardhat", "local"];

const SEPOLIA_ID = Number(process.env.SEPOLIA_ID);
const netCfgMap = {
    SEPOLIA_ID: {
        dataFeed: {
            usdPerEth: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
        }
    }
}

module.exports = {
    devNetList,
    netCfgMap
}