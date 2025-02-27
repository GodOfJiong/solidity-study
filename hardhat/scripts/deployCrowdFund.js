const {ethers} = require("hardhat");

async function deploy () {
    const crowdFundFactory = await ethers.getContractFactory("CrowdFund");
    console.log("deploy start");
    const crowdFund = await crowdFundFactory.deploy(180);
    await crowdFund.waitForDeployment();
    console.log(`deploy done, address: ${crowdFund.target}`);
}

deploy().then().catch((error) => {
    console.error(error);
    process.exit(1);
});