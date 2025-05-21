const {task} = require("hardhat/config");

task("mintCCT", "mint CCT of accounts").setAction(async (taskArgs, hre) => {
    const {testAccount1} = await getNamedAccounts();
    const crossChainToken = await ethers.getContract(process.env.CONTRACT_NAME_CCT, testAccount1);
    console.log("CCT mint start");
    const mintTx = await crossChainToken.safeMint(testAccount1);
    await mintTx.wait();
    console.log("CCT mint done");
});

module.exports = {};