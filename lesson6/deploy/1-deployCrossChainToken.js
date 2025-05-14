module.exports = async ({getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy, log} = deployments;

    log("deploy CrossChainToken start");
    const crossChainToken = await deploy(process.env.CONTRACT_NAME_CCT, {
        from: testAccount1,
        args: [process.env.TOKEN_NAME_CCT, process.env.TOKEN_SYMBOL_CCT],
        log: true
    });

    log("deploy CrossChainToken done");
}

module.exports.tags = [process.env.DEPLOY_TAG_ALL, process.env.DEPLOY_TAG_SRC_CHAIN];