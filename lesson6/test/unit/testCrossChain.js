const {ethers, getNamedAccounts, deployments} = require("hardhat");
const {expect} = require("chai");
const {devNetList} = require("../../complexConfig");

// 一般而言，单元测试在本地环境下进行。
if (devNetList.includes(hre.network.name)) {
    describe("unit test cross chain", async () => {
        let testAccount1;
        let ccipSimulator;
        let crossChainToken;
        let crossChainTokenPool;
        let wrappedCrossChainToken;
        let wrappedCrossChainTokenPool;
        let chainSelector;
        before(async () => {
            testAccount1 = (await getNamedAccounts()).testAccount1;
            await deployments.fixture(["all"]);
            ccipSimulator = await ethers.getContract("CCIPLocalSimulator", testAccount1);
            crossChainToken = await ethers.getContract("CrossChainToken", testAccount1);
            crossChainTokenPool = await ethers.getContract("CrossChainTokenPool", testAccount1);
            wrappedCrossChainToken = await ethers.getContract("WrappedCrossChainToken", testAccount1);
            wrappedCrossChainTokenPool = await ethers.getContract("WrappedCrossChainTokenPool", testAccount1);
            chainSelector = (await ccipSimulator.configuration()).chainSelector_;
        });

        it("test CCT mint from source chain", async () => {
            await crossChainToken.safeMint(testAccount1);
            expect(await crossChainToken.ownerOf(0)).to.equal(testAccount1);
        });

        it("test CCT transfered & locked in CCTP, also sent to WCCTP", async () => {
            await crossChainToken.approve(crossChainTokenPool.target, 0);

            // 试验证明，在本地环境使用CCIP模拟器的时候，CCIP流程是不需要手续费的。
            // await ccipSimulator.requestLinkFromFaucet(crossChainTokenPool.target, ethers.parseEther(process.env.TEST_POOL_FUND));
            await crossChainTokenPool.lockAndSendToken(0, testAccount1, chainSelector, wrappedCrossChainTokenPool.target);
            expect(await crossChainToken.ownerOf(0)).to.equal(crossChainTokenPool.target);
        });

        it("test WCCTP receive CCIP msg & mint WCCT", async () => {
            expect(await wrappedCrossChainToken.ownerOf(0)).to.equal(testAccount1);
        });
    });
}