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
    const wcctAddr = (await deployments.get("WrappedCrossChainToken")).address;
    log("deploy WrappedCrossChainTokenPool start");
    const wrappedCrossChainTokenPool = await deploy("WrappedCrossChainTokenPool", {
        from: testAccount1,
        args: [ccipCfg.destinationRouter_, ccipCfg.linkToken_, wcctAddr],
        log: true
    });

    log("deploy WrappedCrossChainTokenPool done");
}

module.exports.tags = ["all", "destinationchain"];