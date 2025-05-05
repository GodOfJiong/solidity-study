const {ethers} = require("ethers");
const {devNetList, netCfgMap} = require("../complexConfig");

module.exports = async ({network, getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy, log} = deployments;
    let ccipAddr;
    if (devNetList.includes(network.name)) {
        ccipAddr = (await deployments.get("CCIPLocalSimulator")).address;
    } else {
        ccipAddr = netCfgMap[network.config.chainId].ccip;
    }

    const ccip = await ethers.getContractAt("CCIPLocalSimulator", ccipAddr);
    const ccipCfg = await ccip.configuration();
    const cctAddr = (await deployments.get("CrossChainToken")).address;
    log("deploy CrossChainTokenPool start");
    const crossChainTokenPool = await deploy("CrossChainTokenPool", {
        from: testAccount1,
        args: [ccipCfg.sourceRouter_, ccipCfg.linkToken_, cctAddr],
        log: true
    });

    log("deploy CrossChainTokenPool done");
}

module.exports.tags = ["all", "sourcechain"];