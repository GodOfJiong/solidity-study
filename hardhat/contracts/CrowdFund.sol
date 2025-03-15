// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract CrowdFund {

    address owner;
    mapping(address => uint256) accountBalanceMap;
    
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
    bool withdrawFlag = false;

    event withdrawDone(uint256);
    event refundDone(address, uint256);

    constructor (uint256 pLockTime, address dataFeedAddr) {
        dataFeed = AggregatorV3Interface(dataFeedAddr);
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

    function getOwner () public view returns (address) {
        return owner;
    }

    function setOwner (address pOwner) public onlyOwner {
        owner = pOwner;
    }

    function getAccountBalance (address account) public view returns (uint256) {
        return accountBalanceMap[account];
    }

    function getDataFeed () public view returns (AggregatorV3Interface) {
        return dataFeed;
    }

    function getDeployTime () public view returns (uint256) {
        return deployTime;
    }

    function getLockTime () public view returns (uint256) {
        return lockTime;
    }

    function getWithdrawFlag () public view returns (bool) {
        return withdrawFlag;
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
        uint256 balance = address(this).balance;
        require(convertEthToDollar(balance) >= TARGET_FUND, "target fund not reached");
        // payable(msg.sender).transfer(balance);
        // withdrawFlag = true;

        // withdrawFlag = payable(msg.sender).send(balance);
        // require(withdrawFlag, "transaction failed");

        (withdrawFlag, ) = payable(msg.sender).call{value: balance}("");
        require(withdrawFlag, "transaction failed");
        accountBalanceMap[msg.sender] = 0;
        emit withdrawDone(balance);
    }

    function refund () external windowClosed {
        uint256 accountBalance = accountBalanceMap[msg.sender];
        require(convertEthToDollar(address(this).balance) < TARGET_FUND, "target fund reached");
        require(accountBalance > 0, "you have no fund"); 
        bool flag;
        (flag, ) = payable(msg.sender).call{value: accountBalance}("");
        require(flag, "transaction failed");
        accountBalanceMap[msg.sender] = 0;
        emit refundDone(msg.sender, accountBalance);
    }

    function setFundTokenAddr (address pFundTokenAddr) public onlyOwner {
        fundTokenAddr = pFundTokenAddr;
    }

    function setAccountBalance (address account, uint256 balance) external {
        require(msg.sender == fundTokenAddr, "you have no permission to call this function");
        accountBalanceMap[account] = balance;
    }
}