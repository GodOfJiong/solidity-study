const {task} = require("hardhat/config");

task("checkWCCT", "check WCCT of accounts").setAction(async (taskArgs, hre) => {
    const {testAccount1} = await getNamedAccounts();
    const wrappedCrossChainToken = await ethers.getContract(process.env.CONTRACT_NAME_WCCT, testAccount1);
    const numWCCT = await wrappedCrossChainToken.totalSupply();
    console.log("WCCT account map:");
    for (let tokenID = 0; tokenID < numWCCT; ++tokenID) {
        console.log(`token ID: ${tokenID}, account: ${await wrappedCrossChainToken.ownerOf(tokenID)}`);
    }
});

module.exports = {};