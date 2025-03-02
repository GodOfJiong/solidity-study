const {task} = require("hardhat/config");

task("testCrowdFund", "simple test CrowdFund, param: addr: address of CrowdFund")
    .addParam("addr", "contract address of CrowdFund")
    .setAction(async (taskArgs, hre) => {
        const crowdFundFactory = await ethers.getContractFactory("CrowdFund");
        const crowdFund = crowdFundFactory.attach(taskArgs.addr);

        const [testAccount1, testAccount2] = await ethers.getSigners();
        console.log("1st account fund start");
        let fundTx = await crowdFund.connect(testAccount1).fund({value: ethers.parseEther("0.00000453")});
        await fundTx.wait();
        let balance = await ethers.provider.getBalance(crowdFund.target);
        console.log(`1st account fund done, contract balance: ${balance}`);
        
        console.log("2nd account fund start");
        fundTx = await crowdFund.connect(testAccount2).fund({value: ethers.parseEther("0.00000453")});
        await fundTx.wait();
        balance = await ethers.provider.getBalance(crowdFund.target);
        console.log(`2nd account fund done, contract balance: ${balance}`);
        
        console.log(`1st account: ${testAccount1.address}, balance: ${await crowdFund.accountBalanceMap(testAccount1.address)}`);
        console.log(`2nd account: ${testAccount2.address}, balance: ${await crowdFund.accountBalanceMap(testAccount2.address)}`);
    });

module.exports = {};