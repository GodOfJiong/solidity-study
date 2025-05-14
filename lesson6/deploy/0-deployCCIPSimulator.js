const {devNetList} = require("../complexConfig");

module.exports = async ({network, getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    if (devNetList.includes(network.name)) {
        const {testAccount1} = await getNamedAccounts();
        log("deploy CCIPSimulator start");
        await deploy(process.env.CONTRACT_NAME_MOCK_CCIP, {
            from: testAccount1,
            args: [],
            log: true
        });

        log("deploy CCIPSimulator done");
    } else {
        log("CCIPSimulator not need without local network");
    }
}

module.exports.tags = [process.env.DEPLOY_TAG_ALL, process.env.DEPLOY_TAG_SRC_CHAIN, process.env.DEPLOY_TAG_DEST_CHAIN];