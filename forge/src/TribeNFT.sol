// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TribeNFT is ERC721, ERC721Enumerable, Ownable {
    enum Tier { Bronze, Silver, Gold }

    uint256[3] public maxSupplies;
    uint256[3] public prices; // in wei (ETH)
    uint256[3] public currentSupplies;
    mapping(uint256 => Tier) public tokenTiers;
    mapping(address => mapping(Tier => uint256)) public memberTiers;
    uint256 private nextTokenId = 1;

    constructor(
        string memory name,
        address creator,
        uint256[3] memory _maxSupplies,
        uint256[3] memory _prices
    ) ERC721(name, "TRIBE") Ownable(creator) {
        maxSupplies = _maxSupplies;
        prices = _prices;
    }

    function getMemberTiers(address user) public view returns (uint256[3] memory) {
        return [memberTiers[user][Tier.Bronze], memberTiers[user][Tier.Silver], memberTiers[user][Tier.Gold]];
    }

    function mint(Tier tier) public payable {
        uint8 t = uint8(tier);
        require(currentSupplies[t] < maxSupplies[t], "Max supply reached for tier");
        require(msg.value == prices[t], "Incorrect ETH payment amount");

        uint256 tokenId = nextTokenId++;
        tokenTiers[tokenId] = tier;
        currentSupplies[t]++;
        memberTiers[msg.sender][tier]++;
        _safeMint(msg.sender, tokenId);

        // Forward payment to the tribe creator (owner)
        payable(owner()).transfer(msg.value);
    }

    // View function to check if a user has at least one NFT of a specific tier
    function hasTier(address user, Tier tier) public view returns (bool) {
        uint256 bal = balanceOf(user);
        for (uint256 i = 0; i < bal; i++) {
            uint256 tid = tokenOfOwnerByIndex(user, i);
            if (tokenTiers[tid] == tier) {
                return true;
            }
        }
        return false;
    }

    // Required overrides for ERC721 and ERC721Enumerable
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Optional: Creator can update prices if needed
    function updatePrice(Tier tier, uint256 newPrice) public onlyOwner {
        prices[uint8(tier)] = newPrice;
    }

    // Optional: Creator can update max supplies if needed
    function updateMaxSupply(Tier tier, uint256 newMax) public onlyOwner {
        uint8 t = uint8(tier);
        require(newMax >= currentSupplies[t], "Cannot reduce below current supply");
        maxSupplies[t] = newMax;
    }
}