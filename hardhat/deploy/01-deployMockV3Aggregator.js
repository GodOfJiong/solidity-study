module.exports = async ({getNamedAccounts, deployments}) => {
    const {testAccount1} = await getNamedAccounts();
    const {deploy} = deployments;
    await deploy("MockV3Aggregator", {
        from: testAccount1,
        args: [Number(process.env.MOCK_DATA_FEED_PRECISION), Number(process.env.MOCK_DATA_FEED_PRICE)],
        log: true
    });
}

module.exports.tags = ["all", "MockV3Aggregator"];