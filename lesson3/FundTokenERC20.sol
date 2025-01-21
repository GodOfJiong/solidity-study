// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {CrowdFund} from "./CrowdFund.sol";

contract FundTokenERC20 is ERC20 {

    CrowdFund crowdFund;
    
    constructor (address crowdFundAddr) ERC20 ("FundTokenERC20", "FT") {
        crowdFund = CrowdFund(crowdFundAddr);
    }

    modifier getFundDone () {
        require(crowdFund.getFundFlag(), "this function can only be called after get fund");
        _;
    }

    function mint (uint8 num) public getFundDone {
        require(num <= crowdFund.accountBalanceMap(msg.sender), "can not mint over your fund");
        _mint(msg.sender, num);
        crowdFund.setAccountBalance(msg.sender, crowdFund.accountBalanceMap(msg.sender) - num);
    }

    function exchange (uint8 num) public getFundDone {
        require(num <= balanceOf(msg.sender), "can not exchange over your token amount");
        // todo: implement real exchange logic
        _burn(msg.sender, num); 
    }
}