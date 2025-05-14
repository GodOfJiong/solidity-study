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
            await deployments.fixture([process.env.DEPLOY_TAG_ALL]);
            ccipSimulator = await ethers.getContract(process.env.CONTRACT_NAME_MOCK_CCIP, testAccount1);
            crossChainToken = await ethers.getContract(process.env.CONTRACT_NAME_CCT, testAccount1);
            crossChainTokenPool = await ethers.getContract(process.env.CONTRACT_NAME_CCTP, testAccount1);
            wrappedCrossChainToken = await ethers.getContract(process.env.CONTRACT_NAME_WCCT, testAccount1);
            wrappedCrossChainTokenPool = await ethers.getContract(process.env.CONTRACT_NAME_WCCTP, testAccount1);
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

        it("test WCCT transfered & burned in WCCTP, also tell CCTP", async () => {
            await wrappedCrossChainToken.approve(wrappedCrossChainTokenPool.target, 0);

            // 试验证明，在本地环境使用CCIP模拟器的时候，CCIP流程是不需要手续费的。
            // await ccipSimulator.requestLinkFromFaucet(wrappedCrossChainTokenPool.target, ethers.parseEther(process.env.TEST_POOL_FUND));
            await wrappedCrossChainTokenPool.burnAndSendToken(0, testAccount1, chainSelector, crossChainTokenPool.target);
            expect(await wrappedCrossChainToken.totalSupply()).to.equal(0);
        });

        it("test CCTP receive CCIP msg & release CCT", async () => {
            expect(await crossChainToken.ownerOf(0)).to.equal(testAccount1);
        });
    });
}