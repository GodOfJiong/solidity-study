require("dotenv").config();
require("@chainlink/env-enc").config();
require("./tasks/index");

// 在一个需要科学上网才能访问互联网的神奇国度中，即便驾了梯子，在使用hardhat进行合约验证时，还是会遇到网络连不上的超时问题，报错如下：
// Etherscan: A network request failed. This is an error from the block explorer, not Hardhat. Error: Connect Timeout Error
// 解决步骤：1、在梯子中设置允许LAN访问，不同的梯子，设置入口和配置项的称呼可能不一样，视具体情况而定。
// 该配置项的意思是：允许局域网包括本地，访问梯子打开的代理入口。
// 2、node安装undici包，具体为：打开命令行，执行：npm install --save-dev undici；
// 3、在hardhat.config.js中，添加以下3行代码，把梯子打开的代理地址填（如：http://127.0.0.1:7890）作为参数传给ProxyAgent构造函数。
// 该代理地址可在本地的设置->网络和Internet->代理当中找到。
const {ProxyAgent, setGlobalDispatcher} = require("undici");
const proxyAgent = new ProxyAgent(process.env.PROXY_HOST);
setGlobalDispatcher(proxyAgent);

require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-ethers");
require('hardhat-deploy');
require("hardhat-deploy-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: process.env.COMPILE_VERSION,
  networks: {
    sepolia: {
      chainId: Number(process.env.SEPOLIA_ID),
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.TEST_ACCOUNT_1, process.env.TEST_ACCOUNT_2]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_KEY
    }
  },
  sourcify: {
    enabled: true
  },
  namedAccounts: {
    testAccount1: {
      default: 0
    },
    testAccount2: {
      default: 1
    }
  },
  mocha: {
    timeout: 300000
  }
};
