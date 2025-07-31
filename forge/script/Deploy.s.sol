// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TribeFactory} from "../src/TribeFactory.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        TribeFactory factory = new TribeFactory();

        console.log("Factory deployed to:", address(factory));
        console.log("Deployer:", msg.sender);

        vm.stopBroadcast();
    }
}