const {task} = require("hardhat/config");
const {netCfgMap} = require("../complexConfig");

task("destToSrc", "WCCT from destination chain to source chain") // 这里添加的参数将来自命令行，命令行的输入尽量不要用大写，因此，参数名全小写。
    .addParam("tokenid", "token ID").setAction(async (taskArgs, hre) => {
        const {testAccount1} = await getNamedAccounts();
        const chainSelector = netCfgMap[process.env.SEPOLIA_ID].selector;
        const receiver = (await hre.companionNetworks["destChain"].deployments.get(process.env.CONTRACT_NAME_CCTP)).address;
        const linkToken = await ethers.getContractAt(process.env.CONTRACT_NAME_LINK, netCfgMap[hre.network.config.chainId].link);
        const wrappedCrossChainToken = await ethers.getContract(process.env.CONTRACT_NAME_WCCT, testAccount1);
        const wrappedCrossChainTokenPool = await ethers.getContract(process.env.CONTRACT_NAME_WCCTP, testAccount1);

        const tx1 = await linkToken.transfer(wrappedCrossChainTokenPool.target, ethers.parseEther(process.env.TEST_POOL_FUND));
        await tx1.wait();
        console.log(`link balance of WCCTP: ${await linkToken.balanceOf(wrappedCrossChainTokenPool.target)}`);
        await wrappedCrossChainToken.approve(wrappedCrossChainTokenPool.target, taskArgs.tokenid);

        const tx2 = await wrappedCrossChainTokenPool.burnAndSendToken(taskArgs.tokenid, testAccount1, chainSelector, receiver);
        console.log(`CCIP transaction hash: ${tx2.hash}`);
    });

module.exports = {}