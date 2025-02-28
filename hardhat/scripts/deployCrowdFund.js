const {ethers} = require("hardhat");

async function main () {
    const crowdFund = await deploy();
    await verify(crowdFund);
}

async function deploy () {
    const crowdFundFactory = await ethers.getContractFactory("CrowdFund");

    // 这里的deploy只是发出部署请求，工厂没法跟踪单个合约实例是否已经上链了。
    // 所以要通过工厂返回的合约实例句柄，调用waitForDeployment，等待上链部署成功。
    console.log("deploy start");
    const crowdFund = await crowdFundFactory.deploy(process.env.CROWD_FUND_LOCK_TIME);
    await crowdFund.waitForDeployment();
    console.log(`deploy done, address: ${crowdFund.target}`);
    return crowdFund;
}

async function verify (crowdFund) {
    if (hre.network.config.chainId == Number(process.env.SEPOLIA_ID)) {
        // 合约部署成功后，只是链上已经有了，但区块链浏览器的数据库还未同步。而验证合约要用到区块链浏览器的API，但合约地址和其它信息却还没同步过来。
        // 所以需要等待，等待一定数量的区块已经写入合约后，大概率区块链浏览器也应该同步过来了，再进行合约验证。
        await crowdFund.deploymentTransaction().wait(process.env.NUM_BLOCK_WAIT);
        console.log("contract written into " + process.env.NUM_BLOCK_WAIT + " blocks");
        await hre.run("verify:verify", {
            address: crowdFund.target,
            constructorArguments: [process.env.CROWD_FUND_LOCK_TIME]
        });
    } else {
        console.log("no verify in local network");
    }
}

main().then().catch((error) => {
    console.error(error);
    process.exit(1);
});