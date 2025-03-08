module.exports = async ({getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy} = deployments;
    await deploy("CrowdFund", {
        from: testAccount1,
        args: [process.env.CROWD_FUND_LOCK_TIME],
        log: true
    });
}

module.exports.tags = ["all", "CrowdFund"];