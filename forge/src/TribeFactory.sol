// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TribeNFT.sol";

contract TribeFactory {

    // Add a list to track all tribes
    address[] public tribes;
    mapping(address => address[]) public creatorTribes;

    event TribeCreated(address tribeAddress, address creator, string name, string description);

    function createTribe(
        string memory name,
        string memory description,
        uint256[3] memory maxSupplies, // [bronze, silver, gold]
        uint256[3] memory prices // [bronze, silver, gold] in wei
    ) public returns (address) {
        TribeNFT tribe = new TribeNFT(name, description, msg.sender, maxSupplies, prices);
        tribes.push(address(tribe));
        creatorTribes[msg.sender].push(address(tribe));
        emit TribeCreated(address(tribe), msg.sender, name, description);
        return address(tribe);
    }
}

