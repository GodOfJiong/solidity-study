const {ethers} = require("hardhat");
const {devNetList, netCfgMap} = require("../complexConfig");

module.exports = async ({network, getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy, log} = deployments;
    let srcRouterAddr;
    let linkAddr;
    if (devNetList.includes(network.name)) {
        const ccipAddr = (await deployments.get(process.env.CONTRACT_NAME_MOCK_CCIP)).address;
        const ccip = await ethers.getContractAt(process.env.CONTRACT_NAME_MOCK_CCIP, ccipAddr);
        const ccipCfg = await ccip.configuration();
        srcRouterAddr = ccipCfg.sourceRouter_;
        linkAddr = ccipCfg.linkToken_;
    } else {
        srcRouterAddr = netCfgMap[network.config.chainId].router;
        linkAddr = netCfgMap[network.config.chainId].link;
    }

    
    const cctAddr = (await deployments.get(process.env.CONTRACT_NAME_CCT)).address;
    log("deploy CrossChainTokenPool start");
    const crossChainTokenPool = await deploy(process.env.CONTRACT_NAME_CCTP, {
        from: testAccount1,
        args: [srcRouterAddr, linkAddr, cctAddr],
        log: true
    });

    log("deploy CrossChainTokenPool done");
}

module.exports.tags = [process.env.DEPLOY_TAG_ALL, process.env.DEPLOY_TAG_SRC_CHAIN];