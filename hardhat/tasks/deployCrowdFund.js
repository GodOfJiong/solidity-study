const {task} = require("hardhat/config");
const {devNetList, netCfgMap} = require("../complexConfig");

task("deployCrowdFund", "deploy & verify CrowdFund").setAction(async (taskArgs, hre) => {
    const crowdFundFactory = await ethers.getContractFactory("CrowdFund");
    let dataFeedAddr;
    if (devNetList.includes(hre.network.name)) {
        const dataFeedFactory = await ethers.getContractFactory("MockV3Aggregator");
        console.log("dataFeed deploy start");
        const dataFeed = await dataFeedFactory.deploy(Number(process.env.MOCK_DATA_FEED_PRECISION), Number(process.env.MOCK_DATA_FEED_PRICE));
        await dataFeed.waitForDeployment();
        dataFeedAddr = dataFeed.target;
        console.log(`dataFeed deploy done, address: ${dataFeedAddr}`);
    } else {
        dataFeedAddr = netCfgMap[hre.network.config.chainId].dataFeed.usdPerEth;
    }
    
    // 这里的deploy只是发出部署请求，工厂没法跟踪单个合约实例是否已经上链了。
    // 所以要通过工厂返回的合约实例句柄，调用waitForDeployment，等待上链部署成功。
    // 部署合约会有这种情况，而部署合约也属于一种交易请求，所有交易请求都会有这种情况。
    console.log("crowdFund deploy start");
    const crowdFund = await crowdFundFactory.deploy(Number(process.env.CROWD_FUND_LOCK_TIME), dataFeedAddr);
    await crowdFund.waitForDeployment();
    console.log(`crowdFund deploy done, address: ${crowdFund.target}`);
    
    if (hre.network.config.chainId == Number(process.env.SEPOLIA_ID)) {
        // 合约部署成功后，只是链上已经有了，但区块链浏览器的数据库还未同步。而验证合约要用到区块链浏览器的API，但合约地址和其它信息却还没同步过来。
        // 所以需要等待，等待一定数量的区块已经写入合约后，大概率区块链浏览器也应该同步过来了，再进行合约验证。
        await crowdFund.deploymentTransaction().wait(Number(process.env.NUM_BLOCK_WAIT));
        console.log("contract written into some blocks");
        await hre.run("verify:verify", {
            address: crowdFund.target,
            constructorArguments: [Number(process.env.CROWD_FUND_LOCK_TIME), dataFeedAddr]
        });
    } else {
        console.log("no verify in current network");
    }
});

module.exports = {};