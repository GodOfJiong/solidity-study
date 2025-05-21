const {task} = require("hardhat/config");
const {netCfgMap} = require("../complexConfig");

task("srcToDest", "CCT from source chain to destination chain") // 这里添加的参数将来自命令行，命令行的输入尽量不要用大写，因此，参数名全小写。
    .addParam("tokenid", "token ID").setAction(async (taskArgs, hre) => {
        const {testAccount1} = await getNamedAccounts();
        const chainSelector = netCfgMap[process.env.AMOY_ID].selector;
        const receiver = (await hre.companionNetworks["destChain"].deployments.get(process.env.CONTRACT_NAME_WCCTP)).address;
        const linkToken = await ethers.getContractAt(process.env.CONTRACT_NAME_LINK, netCfgMap[hre.network.config.chainId].link);
        const crossChainToken = await ethers.getContract(process.env.CONTRACT_NAME_CCT, testAccount1);
        const crossChainTokenPool = await ethers.getContract(process.env.CONTRACT_NAME_CCTP, testAccount1);

        const tx1 = await linkToken.transfer(crossChainTokenPool.target, ethers.parseEther(process.env.TEST_POOL_FUND));
        await tx1.wait();
        console.log(`link balance of CCTP: ${await linkToken.balanceOf(crossChainTokenPool.target)}`);
        await crossChainToken.approve(crossChainTokenPool.target, taskArgs.tokenid);

        const tx2 = await crossChainTokenPool.lockAndSendToken(taskArgs.tokenid, testAccount1, chainSelector, receiver);
        console.log(`CCIP transaction hash: ${tx2.hash}`);
    });

module.exports = {}