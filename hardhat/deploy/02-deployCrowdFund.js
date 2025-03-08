const {devNetList, netCfgMap} = require("../complexConfig");

module.exports = async ({network, getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy} = deployments;

    let dataFeedAddr;
    if (devNetList.includes(network.name)) {
        dataFeedAddr = (await deployments.get("MockV3Aggregator")).address;
    } else {
        dataFeedAddr = netCfgMap[network.config.chainId].dataFeed.usdPerEth;
    }

    await deploy("CrowdFund", {
        from: testAccount1,
        args: [Number(process.env.CROWD_FUND_LOCK_TIME), dataFeedAddr],
        log: true
    });
}

module.exports.tags = ["all", "CrowdFund"];