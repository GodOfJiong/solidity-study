// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloWorld {
    // bool boolVar1 = true;
    // bool boolVar2 = false;

    // uint256 uintVar = 2;
    // int256 intVar = -1;

    // bytes11 bytesVar = "Hello World";
    string strVar = "Hello World";

    // address addrVar = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;

    struct MultiLangString {
        uint8 id;
        string phrase;
        address addr;
    }

    MultiLangString[] multiLangStrList;
    mapping(uint8 => MultiLangString) multiLangStrMap;

    function sayHello (uint8 pid) public view returns (string memory) {
        if (multiLangStrMap[pid].addr == address(0x0)) {
            return addInfo(strVar);
        } else {
            return addInfo(multiLangStrMap[pid].phrase);
        }
    }

    function setHelloWorld (uint8 pid, string memory newStr) public {
        MultiLangString memory multiLangStr = MultiLangString(pid, newStr, msg.sender);
        multiLangStrMap[pid] = multiLangStr;
    }

    function addInfo (string memory hwStr) internal pure returns (string memory) {
        return string.concat(hwStr, " from Frank's contract.");
    }
}