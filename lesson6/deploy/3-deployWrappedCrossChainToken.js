module.exports = async ({getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy, log} = deployments;

    log("deploy WrappedCrossChainToken start");
    const wrappedCrossChainToken = await deploy("WrappedCrossChainToken", {
        from: testAccount1,
        args: ["WrappedCrossChainToken", "WCCT"],
        log: true
    });

    log("deploy WrappedCrossChainToken done");
}

module.exports.tags = ["all", "destinationchain"];