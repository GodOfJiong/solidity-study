const {ethers, deployments, getNamedAccounts} = require("hardhat");
const {assert, expect} = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {devNetList, netCfgMap} = require("../../complexConfig");

describe("test CrowdFund", async () => {
    let testAccount1;
    let dataFeedAddr;
    let crowdFund;
    beforeEach(async () => {
        testAccount1 = (await getNamedAccounts()).testAccount1;
        await deployments.fixture(["all"]);
        const crowdFundDeploy = await deployments.get("CrowdFund");
        crowdFund = await ethers.getContractAt("CrowdFund", crowdFundDeploy.address);
        dataFeedAddr =
            devNetList.includes(hre.network.name) ?
            (await deployments.get("MockV3Aggregator")).address :
            netCfgMap[hre.network.config.chainId].dataFeed.usdPerEth;
        
        console.log(`
            address: ${crowdFund.target},
            deploy time: ${await crowdFund.getDeployTime()},
            lock time: ${await crowdFund.getLockTime()}
        `);
    });

    it("test constructor: init owner", async () => {
        assert.equal((await crowdFund.getOwner()), testAccount1);
    });

    it("test constructor: init dataFeed", async () => {
        assert.equal((await crowdFund.getDataFeed()), dataFeedAddr);
    });

    it("test fund: window close", async () => {
        // 这里的时间模拟逻辑，有点像时间机器，直接让时钟前进了一段，以触发CrowdFund的fund函数的窗口过期失效。
        await helpers.time.increase(Number(process.env.CROWD_FUND_LOCK_TIME) + 1);
        await helpers.mine();
        expect(
            crowdFund.fund({value: ethers.parseEther(process.env.TEST_FUND_AMOUNT_PASS)})
        ).to.be.revertedWith("can not fund out of the window");
    });

    it("test fund: fund amount not enough", async () => {
        expect(
            crowdFund.fund({value: ethers.parseEther(process.env.TEST_FUND_AMOUNT_FAIL)})
        ).to.be.revertedWith("fund at least $0.01 each time");
    });

    it("test fund: done", async () => {
        assert.equal((await crowdFund.getAccountBalance(testAccount1)), 0);
        const fundAmtInWei = ethers.parseEther(process.env.TEST_FUND_AMOUNT_PASS);
        await crowdFund.fund({value: fundAmtInWei});
        assert.equal((await crowdFund.getAccountBalance(testAccount1)), fundAmtInWei);
    });
});