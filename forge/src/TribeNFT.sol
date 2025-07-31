// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TribeNFT is ERC721, ERC721Enumerable, Ownable {
    enum Tier { Bronze, Silver, Gold }

    string public description;
    uint256[3] public maxSupplies;
    uint256[3] public prices; // in wei (ETH)
    uint256[3] public currentSupplies;
    mapping(uint256 => Tier) public tokenTiers;
    mapping(address => mapping(Tier => uint256)) public memberTiers;
    uint256 private nextTokenId = 1;

    // Marketplace functionality
    struct Listing {
        uint256 price;
        uint256 expiration;
        address seller;
        bool active;
    }
    
    mapping(uint256 => Listing) public listings;
    uint256[] public activeListings;
    
    event TokenListed(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 expiration);
    event TokenSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);

    constructor(
        string memory name,
        string memory _description,
        address creator,
        uint256[3] memory _maxSupplies,
        uint256[3] memory _prices
    ) ERC721(name, "TRIBE") Ownable(creator) {
        description = _description;
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

    // Update description (only owner)
    function updateDescription(string memory newDescription) public onlyOwner {
        description = newDescription;
    }

    // MARKETPLACE FUNCTIONS
    
    // List a token for sale
    function listToken(uint256 tokenId, uint256 price, uint256 expiration) public {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can list");
        require(price > 0, "Price must be greater than 0");
        require(expiration > block.timestamp, "Expiration must be in the future");
        require(!listings[tokenId].active, "Token already listed");
        
        listings[tokenId] = Listing({
            price: price,
            expiration: expiration,
            seller: msg.sender,
            active: true
        });
        
        activeListings.push(tokenId);
        
        emit TokenListed(tokenId, msg.sender, price, expiration);
    }
    
    // Cancel a listing
    function cancelListing(uint256 tokenId) public {
        require(listings[tokenId].seller == msg.sender, "Only seller can cancel");
        require(listings[tokenId].active, "Listing not active");
        
        listings[tokenId].active = false;
        _removeFromActiveListings(tokenId);
        
        emit ListingCancelled(tokenId, msg.sender);
    }
    
    // Buy a listed token
    function buyToken(uint256 tokenId) public payable {
        Listing storage listing = listings[tokenId];
        require(listing.active && block.timestamp <= listing.expiration, "Token not available");
        require(msg.value == listing.price, "Incorrect payment");
        require(msg.sender != listing.seller, "Cannot buy own token");
        
        address seller = listing.seller;
        listing.active = false;
        _removeFromActiveListings(tokenId);
        
        // Update tier counts
        Tier tier = tokenTiers[tokenId];
        memberTiers[seller][tier]--;
        memberTiers[msg.sender][tier]++;
        
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);
        
        emit TokenSold(tokenId, seller, msg.sender, listing.price);
    }
    
    // View all active listings
    function getActiveListings() public view returns (uint256[] memory) {
        return activeListings;
    }
    
    // Get listing details for a token
    function getListing(uint256 tokenId) public view returns (Listing memory) {
        return listings[tokenId];
    }
    
    // Check if a token is listed and not expired
    function isTokenForSale(uint256 tokenId) public view returns (bool) {
        Listing memory listing = listings[tokenId];
        return listing.active && block.timestamp <= listing.expiration;
    }
    
    // Internal function to remove token from active listings array
    function _removeFromActiveListings(uint256 tokenId) internal {
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (activeListings[i] == tokenId) {
                activeListings[i] = activeListings[activeListings.length - 1];
                activeListings.pop();
                break;
            }
        }
    }
}