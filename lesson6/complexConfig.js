const devNetList = ["hardhat", "local"];

let netCfgMap = {};
netCfgMap[Number(process.env.SEPOLIA_ID)] = {
    name: "sepolia",
    router: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    link: "0x779877A7B0D9E8603169DdbD7836e478b4624789"
}

module.exports = {
    devNetList,
    netCfgMap
}