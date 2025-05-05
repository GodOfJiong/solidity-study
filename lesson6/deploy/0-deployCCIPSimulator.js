module.exports = async ({getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy, log} = deployments;

    log("deploy CCIPSimulator start");
    await deploy("CCIPLocalSimulator", {
        from: testAccount1,
        args: [],
        log: true
    });

    log("deploy CCIPSimulator done");
}

module.exports.tags = ["all", "sourcechain", "destinationchain"];