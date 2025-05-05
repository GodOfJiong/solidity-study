module.exports = async ({getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy, log} = deployments;

    log("deploy CrossChainToken start");
    const crossChainToken = await deploy("CrossChainToken", {
        from: testAccount1,
        args: ["CrossChainToken", "CCT"],
        log: true
    });

    log("deploy CrossChainToken done");
}

module.exports.tags = ["all", "sourcechain"];