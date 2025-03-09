const {devNetList, netCfgMap} = require("../complexConfig");

module.exports = async ({network, getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy} = deployments;

    let dataFeedAddr;
    let numBlockWait;
    if (devNetList.includes(network.name)) {
        dataFeedAddr = (await deployments.get("MockV3Aggregator")).address;
        numBlockWait = 0;
    } else {
        // 合约部署成功后，只是链上已经有了，但区块链浏览器的数据库还未同步。而验证合约要用到区块链浏览器的API，但合约地址和其它信息却还没同步过来。
        // 所以需要等待，等待一定数量的区块已经写入合约后，大概率区块链浏览器也应该同步过来了，再进行合约验证。
        dataFeedAddr = netCfgMap[network.config.chainId].dataFeed.usdPerEth;
        numBlockWait = Number(process.env.NUM_BLOCK_WAIT);
    }

    const crowdFund = await deploy("CrowdFund", {
        from: testAccount1,
        args: [Number(process.env.CROWD_FUND_LOCK_TIME), dataFeedAddr],
        log: true,
        waitConfirmations: numBlockWait
    });

    if (network.config.chainId == Number(process.env.SEPOLIA_ID)) {
        await hre.run("verify:verify", {
            address: crowdFund.address,
            constructorArguments: [Number(process.env.CROWD_FUND_LOCK_TIME), dataFeedAddr]
        });
    } else {
        console.log("no verify in current network");
    }
}

module.exports.tags = ["all", "CrowdFund"];