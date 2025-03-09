const {devNetList} = require("../complexConfig");

module.exports = async ({network, getNamedAccounts, deployments}) => {
    if (devNetList.includes(network.name)) {
        const {testAccount1} = await getNamedAccounts();
        const {deploy} = deployments;
        await deploy("MockV3Aggregator", {
            from: testAccount1,
            args: [Number(process.env.MOCK_DATA_FEED_PRECISION), Number(process.env.MOCK_DATA_FEED_PRICE)],
            log: true
        });
    } else {
        console.log("MockV3Aggregator not need without local network");
    }
}

module.exports.tags = ["all", "MockV3Aggregator"];