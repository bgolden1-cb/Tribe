# Tribe

A decentralized platform for creating and managing membership NFT communities with tiered access (Bronze, Silver, Gold).

## SOLIDITY

### Setup Accounts
```bash
# Import test accounts
cast wallet import b --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
cast wallet import c --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

### Deploy Factory

Anvil (Local)
```bash
forge script Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --account b \
  --sender 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --broadcast
```

Testnet (Base Sepolia)
```bash
forge script Deploy \
  --rpc-url https://sepolia.base.org \
  --account dev \
  --sender 0x62cD4935FDb0d76E3Df9096ACa4aa3E020865863 \
  --broadcast \
  --verify \
  --verifier-url https://api.etherscan.io/api \
  --etherscan-api-key CPZBVWX6UDTIXKFCBMNPM51EKSHGZGEVSP
```

## Testing Commands

**Note**: Replace `FACTORY_ADDRESS` with your deployed factory address (e.g., `0x5FbDB2315678afecb367f032d93F642f64180aa3`)  
**Note**: Replace `TRIBE_ADDRESS` with the tribe contract address from the createTribe transaction logs

### 1. Create Tribe
```bash
# Create a new tribe with max supplies [Bronze: 100, Silver: 10, Gold: 3] 
# and prices [0.001 ETH, 0.005 ETH, 0.01 ETH]
cast send FACTORY_ADDRESS "createTribe(string,uint256[3],uint256[3])" \
  "GOATs" "[100, 10, 3]" "[1000000000000000, 5000000000000000, 10000000000000000]" \
  --rpc-url http://127.0.0.1:8545 --account b

# Get tribe address from transaction logs or events
cast logs --from-block 1 --address FACTORY_ADDRESS \
  --rpc-url http://127.0.0.1:8545
```

### 2. List Tribes
```bash
# Listen to TribeCreated events to see all tribes
cast logs --from-block 1 --address FACTORY_ADDRESS \
  "TribeCreated(address,address,string)" \
  --rpc-url http://127.0.0.1:8545
```

### 3. Get Tribe Info
```bash
# Get tribe name
cast call TRIBE_ADDRESS "name()" --rpc-url http://127.0.0.1:8545

# Get tribe symbol
cast call TRIBE_ADDRESS "symbol()" --rpc-url http://127.0.0.1:8545

# Get tribe owner/creator
cast call TRIBE_ADDRESS "owner()" --rpc-url http://127.0.0.1:8545
```

### 4. View Pricing & Supply
```bash
# Get max supplies for each tier [Bronze, Silver, Gold]
cast call TRIBE_ADDRESS "maxSupplies(uint256)" 0 --rpc-url http://127.0.0.1:8545  # Bronze
cast call TRIBE_ADDRESS "maxSupplies(uint256)" 1 --rpc-url http://127.0.0.1:8545  # Silver  
cast call TRIBE_ADDRESS "maxSupplies(uint256)" 2 --rpc-url http://127.0.0.1:8545  # Gold

# Get current supplies for each tier
cast call TRIBE_ADDRESS "currentSupplies(uint256)" 0 --rpc-url http://127.0.0.1:8545  # Bronze
cast call TRIBE_ADDRESS "currentSupplies(uint256)" 1 --rpc-url http://127.0.0.1:8545  # Silver
cast call TRIBE_ADDRESS "currentSupplies(uint256)" 2 --rpc-url http://127.0.0.1:8545  # Gold

# Get prices for each tier (in wei)
cast call TRIBE_ADDRESS "prices(uint256)" 0 --rpc-url http://127.0.0.1:8545  # Bronze
cast call TRIBE_ADDRESS "prices(uint256)" 1 --rpc-url http://127.0.0.1:8545  # Silver
cast call TRIBE_ADDRESS "prices(uint256)" 2 --rpc-url http://127.0.0.1:8545  # Gold
```

### 5. Mint Tokens
```bash
# Mint Bronze token (tier 0) - costs 0.001 ETH
cast send TRIBE_ADDRESS "mint(uint8)" 0 \
  --value 1000000000000000 \
  --rpc-url http://127.0.0.1:8545 --account c

# Mint Silver token (tier 1) - costs 0.005 ETH  
cast send TRIBE_ADDRESS "mint(uint8)" 1 \
  --value 5000000000000000 \
  --rpc-url http://127.0.0.1:8545 --account c

# Mint Gold token (tier 2) - costs 0.01 ETH
cast send TRIBE_ADDRESS "mint(uint8)" 2 \
  --value 10000000000000000 \
  --rpc-url http://127.0.0.1:8545 --account c
```

### 6. Check Member Status
```bash
# Get total NFT balance for an address
cast call TRIBE_ADDRESS "balanceOf(address)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --rpc-url http://127.0.0.1:8545

# Get member tier counts [Bronze, Silver, Gold] 
cast call TRIBE_ADDRESS "getMemberTiers(address)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --rpc-url http://127.0.0.1:8545

# Check if member has specific tier
cast call TRIBE_ADDRESS "hasTier(address,uint8)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 0 \
  --rpc-url http://127.0.0.1:8545  # Bronze
cast call TRIBE_ADDRESS "hasTier(address,uint8)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 \
  --rpc-url http://127.0.0.1:8545  # Silver
cast call TRIBE_ADDRESS "hasTier(address,uint8)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 2 \
  --rpc-url http://127.0.0.1:8545  # Gold
```

### 7. Token Information
```bash
# Get token tier by token ID
cast call TRIBE_ADDRESS "tokenTiers(uint256)" 1 --rpc-url http://127.0.0.1:8545

# Get token owner by token ID
cast call TRIBE_ADDRESS "ownerOf(uint256)" 1 --rpc-url http://127.0.0.1:8545

# Get total supply
cast call TRIBE_ADDRESS "totalSupply()" --rpc-url http://127.0.0.1:8545
```

### 8. Owner Functions (Tribe Creator Only)
```bash
# Update price for a tier (only tribe owner)
cast send TRIBE_ADDRESS "updatePrice(uint8,uint256)" 0 2000000000000000 \
  --rpc-url http://127.0.0.1:8545 --account b  # Update Bronze to 0.002 ETH

# Update max supply for a tier (only tribe owner)  
cast send TRIBE_ADDRESS "updateMaxSupply(uint8,uint256)" 0 200 \
  --rpc-url http://127.0.0.1:8545 --account b  # Update Bronze max to 200
```

## Account Addresses
- **Account b**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Deployer/Creator)
- **Account c**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Test User)

## Tier System
- **Bronze (0)**: Entry level membership
- **Silver (1)**: Premium membership  
- **Gold (2)**: Exclusive membership

## Example Full Test Flow
```bash
# 1. Deploy factory
forge script Deploy --rpc-url http://127.0.0.1:8545 --account b --broadcast

# 2. Create tribe
cast send FACTORY_ADDRESS "createTribe(string,uint256[3],uint256[3])" "TestTribe" "[100,10,3]" "[1000000000000000,5000000000000000,10000000000000000]" --rpc-url http://127.0.0.1:8545 --account b

# 3. Get tribe address from logs
cast logs --from-block latest --address FACTORY_ADDRESS --rpc-url http://127.0.0.1:8545

# 4. Mint tokens
cast send TRIBE_ADDRESS "mint(uint8)" 2 --value 10000000000000000 --rpc-url http://127.0.0.1:8545 --account c

# 5. Verify membership
cast call TRIBE_ADDRESS "hasTier(address,uint8)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 2 --rpc-url http://127.0.0.1:8545
```