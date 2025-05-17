const {ethers} = require("hardhat");
const {devNetList, netCfgMap} = require("../complexConfig");

module.exports = async ({network, getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy, log} = deployments;
    let destRouterAddr;
    let linkAddr;
    if (devNetList.includes(network.name)) {
        const ccipAddr = (await deployments.get(process.env.CONTRACT_NAME_MOCK_CCIP)).address;
        const ccip = await ethers.getContractAt(process.env.CONTRACT_NAME_MOCK_CCIP, ccipAddr);
        const ccipCfg = await ccip.configuration();
        destRouterAddr = ccipCfg.destinationRouter_;
        linkAddr = ccipCfg.linkToken_;
    } else {
        destRouterAddr = netCfgMap[network.config.chainId].router;
        linkAddr = netCfgMap[network.config.chainId].link;
    }

    const wcctAddr = (await deployments.get(process.env.CONTRACT_NAME_WCCT)).address;
    log("deploy WrappedCrossChainTokenPool start");
    const wrappedCrossChainTokenPool = await deploy(process.env.CONTRACT_NAME_WCCTP, {
        from: testAccount1,
        args: [destRouterAddr, linkAddr, wcctAddr],
        log: true
    });

    log("deploy WrappedCrossChainTokenPool done");
}

module.exports.tags = [process.env.DEPLOY_TAG_ALL, process.env.DEPLOY_TAG_DEST_CHAIN];