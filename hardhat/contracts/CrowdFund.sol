// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract CrowdFund {

    address public owner;
    mapping(address => uint256) public accountBalanceMap;
    
    // 我们想表达的初衷，是每次付款不少于$0.01，以人类最自然而然的理解方式，具体就是：
    // 按每个eth比如说$3500.12345678的价格，每次支付的eth数量，乘以该价格，得出来的金额，每次不少于$0.01。
    // 但一方面，Solidity不支持浮点数，另一方面，这个MIN_FUND是要与convertEthToDollar的返回值进行比较的，
    // convertEthToDollar的返回值，刚好是由eth数量乘以eth价格得到的金额，
    // 它里头的数量已经是用wei为单位，也即多乘了10的18次方，价格同样为了精确到小数点后8位，而多乘了10的8次方，
    // 因此，这里的MIN_FUND想表达的这个$0.01，也需要相应多乘共计10的26次方，才能与convertEthToDollar的返回值对得上，从而可比较。
    uint80 constant MIN_FUND = 10 ** 24; // 0.01 * (10 ** 18) * (10 ** 8)
    uint88 constant TARGET_FUND = 10 ** 26; // 1 * (10 ** 18) * (10 ** 8)
    AggregatorV3Interface dataFeed;

    uint256 deployTime;
    uint256 lockTime;

    address fundTokenAddr;
    bool public getFundFlag = false;

    constructor (uint256 pLockTime) {
        // net: Sepolia, type: eth/usd
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        owner = msg.sender;
        deployTime = block.timestamp;
        lockTime = pLockTime;
    }

    // 相当于是自定义修饰符。
    modifier windowClosed () {
        require(block.timestamp > deployTime + lockTime, "can not call this function in the window");
        _;
    }

    modifier onlyOwner () {
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }

    function changeOwner (address newOwner) public onlyOwner {
        owner = newOwner;
    }
    
    function fund () external payable {
        uint256 currentTime = block.timestamp;
        require((currentTime >= deployTime) && (currentTime <= deployTime + lockTime), "can not fund out of the window");
        require(convertEthToDollar(msg.value) >= MIN_FUND, "fund at least $0.01 each time");
        accountBalanceMap[msg.sender] += msg.value;
    }

    function getLatestPriceForSepoliaEth () public view returns (int256) {
        (
            /* uint80 roundID */,
            int256 answer,
            /* uint256 startedAt */,
            /* uint256 timeStamp */,
            /* uint80 answeredInRound */
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToDollar (uint256 ethAmount) internal view returns (uint256) {
        // ChainLink预言机喂价服务的初衷，当然是想返回当前1个eth的价格，且精确到小数点后8位，例如：$3500.12345678。
        // 但由于Solidity不支持浮点数，那就只能把上述小数点后的部分，强行“招安”包含进来到整数部分，变为：$350012345678。
        // 从而，实际返回价格就变为原先的价格的10的8次方倍，后续使用时要注意这点就行。
        return ethAmount * uint256(getLatestPriceForSepoliaEth());
    }    

    function getFund () external windowClosed onlyOwner {
        require(convertEthToDollar(address(this).balance) >= TARGET_FUND, "target fund not reached");
        // payable(msg.sender).transfer(address(this).balance);

        // bool flag = payable(msg.sender).send(address(this).balance);
        // require(flag, "transaction failed");

        bool flag;
        (flag, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(flag, "transaction failed");
        accountBalanceMap[msg.sender] = 0;
        getFundFlag = true;
    }

    function refund () external windowClosed {
        require(convertEthToDollar(address(this).balance) < TARGET_FUND, "target fund reached");
        require(accountBalanceMap[msg.sender] > 0, "you have no fund");
        bool flag;
        (flag, ) = payable(msg.sender).call{value: accountBalanceMap[msg.sender]}("");
        require(flag, "transaction failed");
        accountBalanceMap[msg.sender] = 0;
    }

    function setFundTokenAddr (address pFundTokenAddr) public onlyOwner {
        fundTokenAddr = pFundTokenAddr;
    }

    function setAccountBalance (address account, uint256 balance) external {
        require(msg.sender == fundTokenAddr, "you have no permission to call this function");
        accountBalanceMap[account] = balance;
    }
}