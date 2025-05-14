module.exports = async ({getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy, log} = deployments;

    log("deploy WrappedCrossChainToken start");
    const wrappedCrossChainToken = await deploy(process.env.CONTRACT_NAME_WCCT, {
        from: testAccount1,
        args: [process.env.TOKEN_NAME_WCCT, process.env.TOKEN_SYMBOL_WCCT],
        log: true
    });

    log("deploy WrappedCrossChainToken done");
}

module.exports.tags = [process.env.DEPLOY_TAG_ALL, process.env.DEPLOY_TAG_DEST_CHAIN];