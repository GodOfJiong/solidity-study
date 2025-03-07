const {ethers} = require("hardhat");
const {assert} = require("chai");

describe("test CrowdFund", async function () {
    it("test constructor: init owner", async function () {
        const [testAccount1] = await ethers.getSigners();
        const crowdFundFactory = await ethers.getContractFactory("CrowdFund");
    
        // 这里的deploy只是发出部署请求，工厂没法跟踪单个合约实例是否已经上链了。
        // 所以要通过工厂返回的合约实例句柄，调用waitForDeployment，等待上链部署成功。
        // 部署合约会有这种情况，而部署合约也属于一种交易请求，所有交易请求都会有这种情况。
        console.log("deploy start");
        const crowdFund = await crowdFundFactory.deploy(process.env.CROWD_FUND_LOCK_TIME);
        await crowdFund.waitForDeployment();
        console.log(`
            deploy done,
            address: ${crowdFund.target},
            deploy time: ${await crowdFund.getDeployTime()},
            lock time: ${await crowdFund.getLockTime()}
        `);

        assert.equal((await crowdFund.getOwner()), testAccount1.address);
    });

    it("test constructor: init dataFeed", async function () {
        const crowdFundFactory = await ethers.getContractFactory("CrowdFund");
        const crowdFund = await crowdFundFactory.deploy(process.env.CROWD_FUND_LOCK_TIME);
        await crowdFund.waitForDeployment();
        assert.equal((await crowdFund.getDataFeed()), process.env.DATA_FEED_ADDR);
    });
});