const devNetList = ["hardhat", "local"];

let netCfgMap = {};
netCfgMap[Number(process.env.SEPOLIA_ID)] = {
    name: "sepolia",
    router: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    link: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    selector: "16015286601757825753"
};
netCfgMap[Number(process.env.AMOY_ID)] = {
    name: "amoy",
    router: "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2",
    link: "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904",
    selector: "16281711391670634445"
};

module.exports = {
    devNetList,
    netCfgMap
};