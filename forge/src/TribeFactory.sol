// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TribeNFT.sol";

contract TribeFactory {
    event TribeCreated(address tribeAddress, address creator, string name);

    function createTribe(
        string memory name,
        uint256[3] memory maxSupplies, // [bronze, silver, gold]
        uint256[3] memory prices // [bronze, silver, gold] in wei
    ) public returns (address) {
        TribeNFT tribe = new TribeNFT(name, msg.sender, maxSupplies, prices);
        emit TribeCreated(address(tribe), msg.sender, name);
        return address(tribe);
    }
}
/**
ast send 0xE40D693aD3a9A9fb4fBd953777005B19408381d4 "transfer(address,uint256)" 0x43dE4F92FB5e0156Cd9a9B154A1cf5365610A5DD 100000 --rpc-url https://sepolia.base.org --account dev
 */

// Create Tribe
// cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "createTribe(string,uint256[3],uint256[3])" "GOATs" "[100, 10, 3]" "[1000000000000000, 5000000000000000, 10000000000000000]" --rpc-url http://127.0.0.1:8545 --account a

// Mint Token