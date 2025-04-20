// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {CrossChainToken} from "./CrossChainToken.sol";

contract WrappedCrossChainToken is CrossChainToken {
    
    constructor (string memory tokenName, string memory tokenSymbol) CrossChainToken(tokenName, tokenSymbol) {}

    function mintWithId (address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}