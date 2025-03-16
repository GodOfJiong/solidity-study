const {ethers, deployments, getNamedAccounts} = require("hardhat");
const {expect} = require("chai");
const {devNetList} = require("../../complexConfig");

// 一般而言，集成测试在正式网络上进行。
if (!devNetList.includes(hre.network.name)) {
    describe("integration test CrowdFund", async () => {
        let testAccount1;
        let crowdFund;
        let crowdFund1;
        beforeEach(async () => {
            testAccount1 = (await getNamedAccounts()).testAccount1;

            // 当初在对crowdFund切换账户，以调用fund的时候，使用的是connect，也即：crowdFund.connect(testAccount1).fund(...)；
            // 但要注意，这里的testAccount1是从ethers.getSigners()拿到的signer对象，而非账户地址；
            // 而我们这里的testAccount1直接就是账户地址，所以要切换账户，就不能用上述方式了，要用以下的方式。
            await deployments.fixture(["all"]);
            const crowdFundDeploy = await deployments.get("CrowdFund");
            crowdFund = await ethers.getContractAt("CrowdFund", crowdFundDeploy.address);
            crowdFund1 = await ethers.getContract("CrowdFund", testAccount1);

            console.log(`
                address: ${crowdFund.target},
                deploy time: ${await crowdFund.getDeployTime()},
                lock time: ${await crowdFund.getLockTime()}
            `);
        });

        it("fund and then getFund", async () => {
            const fundAmtInWei = ethers.parseEther(process.env.CONTRACT_BALANCE_PASS);
            await crowdFund1.fund({value: fundAmtInWei});
            await new Promise(resolve => setTimeout(resolve, (Number(process.env.CROWD_FUND_LOCK_TIME) + 1) * 1000));
            expect(
                await (await crowdFund1.getFund()).wait()
            ).to.emit(crowdFund, "withdrawDone").withArgs(fundAmtInWei);
        });

        it("fund and then refund", async () => {
            const fundAmtInWei = ethers.parseEther(process.env.CONTRACT_BALANCE_FAIL);
            await crowdFund1.fund({value: fundAmtInWei});
            await new Promise(resolve => setTimeout(resolve, (Number(process.env.CROWD_FUND_LOCK_TIME) + 1) * 1000));
            expect(
                await (await crowdFund1.refund()).wait()
            ).to.emit(crowdFund, "refundDone").withArgs(testAccount1, fundAmtInWei);
        });
    });
}