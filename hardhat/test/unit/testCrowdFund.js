const {ethers, deployments, getNamedAccounts} = require("hardhat");
const {assert, expect} = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {devNetList, netCfgMap} = require("../../complexConfig");

if (devNetList.includes(hre.network.name)) {
    describe("unit test CrowdFund", async () => {
        let testAccount1;
        let testAccount2;
        let dataFeedAddr;
        let crowdFund;
        let crowdFund1;
        let crowdFund2;
        beforeEach(async () => {
            testAccount1 = (await getNamedAccounts()).testAccount1;
            testAccount2 = (await getNamedAccounts()).testAccount2;

            // 当初在对crowdFund切换账户，以调用fund的时候，使用的是connect，也即：crowdFund.connect(testAccount1).fund(...)；
            // 但要注意，这里的testAccount1是从ethers.getSigners()拿到的signer对象，而非账户地址；
            // 而我们这里的testAccount1直接就是账户地址，所以要切换账户，就不能用上述方式了，要用以下的方式。
            await deployments.fixture(["all"]);
            const crowdFundDeploy = await deployments.get("CrowdFund");
            crowdFund = await ethers.getContractAt("CrowdFund", crowdFundDeploy.address);
            crowdFund1 = await ethers.getContract("CrowdFund", testAccount1);
            crowdFund2 = await ethers.getContract("CrowdFund", testAccount2);

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
            await expect(
                crowdFund1.fund({value: ethers.parseEther(process.env.TEST_FUND_AMOUNT_PASS)})
            ).to.be.revertedWith("can not fund out of the window");
        });

        it("test fund: fund amount not enough", async () => {
            await expect(
                crowdFund1.fund({value: ethers.parseEther(process.env.TEST_FUND_AMOUNT_FAIL)})
            ).to.be.revertedWith("fund at least $0.01 each time");
        });

        it("test fund: done", async () => {
            const fundAmtInWei = ethers.parseEther(process.env.TEST_FUND_AMOUNT_PASS);
            await crowdFund1.fund({value: fundAmtInWei});
            let accountBalance1 = await crowdFund.getAccountBalance(testAccount1); // 此处指账户1在合约中的余额。
            let contractBalance = await ethers.provider.getBalance(crowdFund.target);
            assert.equal(accountBalance1, fundAmtInWei);
            assert.equal(contractBalance, fundAmtInWei);
            await crowdFund1.fund({value: fundAmtInWei});
            assert.equal(await crowdFund.getAccountBalance(testAccount1), accountBalance1 + fundAmtInWei);
            assert.equal(await ethers.provider.getBalance(crowdFund.target), contractBalance + fundAmtInWei);
        });

        it("test getFund: not owner", async () => {
            await crowdFund2.fund({value: ethers.parseEther(process.env.CONTRACT_BALANCE_PASS)});
            await helpers.time.increase(Number(process.env.CROWD_FUND_LOCK_TIME) + 1);
            await helpers.mine();
            await expect(
                crowdFund2.getFund()
            ).to.be.revertedWith("this function can only be called by owner");
        });

        it("test getFund: window open", async () => {
            await crowdFund2.fund({value: ethers.parseEther(process.env.CONTRACT_BALANCE_PASS)});
            await expect(
                crowdFund1.getFund()
            ).to.be.revertedWith("can not call this function in the window");
        });

        it("test getFund: target not reach", async () => {
            await crowdFund2.fund({value: ethers.parseEther(process.env.CONTRACT_BALANCE_FAIL)});
            await helpers.time.increase(Number(process.env.CROWD_FUND_LOCK_TIME) + 1);
            await helpers.mine();
            await expect(
                crowdFund1.getFund()
            ).to.be.revertedWith("target fund not reached");
        });

        it("test getFund: done", async () => {
            const fundAmtInWei = ethers.parseEther(process.env.CONTRACT_BALANCE_PASS);
            await crowdFund2.fund({value: fundAmtInWei});
            await helpers.time.increase(Number(process.env.CROWD_FUND_LOCK_TIME) + 1);
            await helpers.mine();
            console.log(`owner balance before getFund: ${await ethers.provider.getBalance(testAccount1)}`); // 此处指账户1自身的余额。
            await expect(
                crowdFund1.getFund()
            ).to.emit(crowdFund, "withdrawDone").withArgs(fundAmtInWei);

            // 严格来说，应该是要验证：getFund之后，账户1自身的余额 = 账户1之前的余额 + 合约的余额（此处为fundAmtInWei）。
            // 但因为通过账户1调用getFund的操作本身，也会产生手续费从账户1的余额中扣除，手续费具体数额不定。
            // 因此，没法进行上述验证，只好象征性打印一下账户1最新的余额。
            assert.equal(await ethers.provider.getBalance(crowdFund.target), 0);
            console.log(`owner balance after getFund: ${await ethers.provider.getBalance(testAccount1)}`);
            assert.equal(await crowdFund.getAccountBalance(testAccount1), 0);
        });

        it("test refund: window open", async () => {
            await crowdFund1.fund({value: ethers.parseEther(process.env.CONTRACT_BALANCE_FAIL)});
            await expect(
                crowdFund1.refund()
            ).to.be.revertedWith("can not call this function in the window");
        });

        it("test refund: target reach", async () => {
            await crowdFund1.fund({value: ethers.parseEther(process.env.CONTRACT_BALANCE_PASS)});
            await helpers.time.increase(Number(process.env.CROWD_FUND_LOCK_TIME) + 1);
            await helpers.mine();
            await expect(
                crowdFund1.refund()
            ).to.be.revertedWith("target fund reached");
        });

        it("test refund: no fund", async () => {
            await crowdFund1.fund({value: ethers.parseEther(process.env.CONTRACT_BALANCE_FAIL)});
            await helpers.time.increase(Number(process.env.CROWD_FUND_LOCK_TIME) + 1);
            await helpers.mine();
            await expect(
                crowdFund2.refund()
            ).to.be.revertedWith("you have no fund");
        });

        it("test refund: done", async () => {
            const fundAmtInWei = ethers.parseEther(process.env.CONTRACT_BALANCE_FAIL);
            await crowdFund1.fund({value: fundAmtInWei});
            await helpers.time.increase(Number(process.env.CROWD_FUND_LOCK_TIME) + 1);
            await helpers.mine();
            console.log(`account balance before refund: ${await ethers.provider.getBalance(testAccount1)}`);
            await expect(
                crowdFund1.refund()
            ).to.emit(crowdFund, "refundDone").withArgs(testAccount1, fundAmtInWei);

            assert.equal(await ethers.provider.getBalance(crowdFund.target), 0);
            console.log(`account balance after refund: ${await ethers.provider.getBalance(testAccount1)}`);
            assert.equal(await crowdFund.getAccountBalance(testAccount1), 0);
        });
    });
}