// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FundToken {
    
    string public tokenName;
    string public tokenSymbol;
    uint256 public numIssue;
    address public owner;
    mapping(address => uint256) public accountBalanceMap;

    constructor (string memory pTokenName, string memory pTokenSymbol) {
        tokenName = pTokenName;
        tokenSymbol = pTokenSymbol;
        owner = msg.sender;
    }

    function mint (uint8 num) public {
        accountBalanceMap[msg.sender] += num;
        numIssue += num;
    }

    function transfer (address receiver, uint8 num) public {
        require(accountBalanceMap[msg.sender] >= num, "no enough token to transfer");
        accountBalanceMap[msg.sender] -= num;
        accountBalanceMap[receiver] += num;
    }

    function getBalance () public view returns (uint256) {
        return accountBalanceMap[msg.sender];
    }
}