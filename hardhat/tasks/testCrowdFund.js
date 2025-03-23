const {task} = require("hardhat/config");

task("testCrowdFund", "simple test CrowdFund").addParam("addr", "contract address of CrowdFund").setAction(async (taskArgs, hre) => {
    const [testAccount1, testAccount2] = await ethers.getSigners();
    const crowdFundFactory = await ethers.getContractFactory("CrowdFund");
    const crowdFund = crowdFundFactory.attach(taskArgs.addr);

    console.log("1st account fund start");
    let fundTx = await crowdFund.connect(testAccount1).fund({value: ethers.parseEther(process.env.TEST_FUND_AMOUNT_PASS)});
    await fundTx.wait();
    let balance = await ethers.provider.getBalance(crowdFund.target);
    console.log(`1st account fund done, contract balance: ${balance}`);
        
    console.log("2nd account fund start");
    fundTx = await crowdFund.connect(testAccount2).fund({value: ethers.parseEther(process.env.TEST_FUND_AMOUNT_PASS)});
    await fundTx.wait();
    balance = await ethers.provider.getBalance(crowdFund.target);
    console.log(`2nd account fund done, contract balance: ${balance}`);
        
    console.log(`1st account: ${testAccount1.address}, balance: ${await crowdFund.accountBalanceMap(testAccount1.address)}`);
    console.log(`2nd account: ${testAccount2.address}, balance: ${await crowdFund.accountBalanceMap(testAccount2.address)}`);
});

module.exports = {};