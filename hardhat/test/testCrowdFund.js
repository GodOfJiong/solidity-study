const {ethers, deployments, getNamedAccounts} = require("hardhat");
const {assert} = require("chai");

describe("test CrowdFund", async () => {
    let testAccount1;
    let crowdFund;
    before(async () => {
        testAccount1 = (await getNamedAccounts()).testAccount1;
        await deployments.fixture(["all"]);
        const crowdFundDeploy = await deployments.get("CrowdFund");
        crowdFund = await ethers.getContractAt("CrowdFund", crowdFundDeploy.address);
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
        assert.equal((await crowdFund.getDataFeed()), process.env.DATA_FEED_ADDR);
    });
});