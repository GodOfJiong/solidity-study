// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {HelloWorld} from "./HelloWorld.sol";

contract HelloWorldFactory {

    HelloWorld[] helloWorldList;

    function createHelloWorld () public {
        helloWorldList.push(new HelloWorld());
    }

    function getHelloWorld (uint8 index) public view returns (HelloWorld) {
        return helloWorldList[index];
    }

    function callSayHello (uint8 index, uint8 id) public view returns (string memory) {
        return helloWorldList[index].sayHello(id);
    }

    function callSetHello (uint8 index, uint8 id, string calldata phrase) public {
        helloWorldList[index].setHelloWorld(id, phrase);
    }
}