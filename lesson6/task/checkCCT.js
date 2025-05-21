const {task} = require("hardhat/config");

task("checkCCT", "check CCT of accounts").setAction(async (taskArgs, hre) => {
    const {testAccount1} = await getNamedAccounts();
    const crossChainToken = await ethers.getContract(process.env.CONTRACT_NAME_CCT, testAccount1);
    const numCCT = await crossChainToken.totalSupply();
    console.log("CCT account map:");
    for (let tokenID = 0; tokenID < numCCT; ++tokenID) {
        console.log(`token ID: ${tokenID}, account: ${await crossChainToken.ownerOf(tokenID)}`);
    }
});

module.exports = {};