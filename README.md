# Tribe

## SOLIDITTY

### Deploy

Anvil
```
forge script Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --account b \
  --sender 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --broadcast
```

Testnet
```
forge script Deploy \
  --rpc-url https://sepolia.base.org \
  --account dev \
  --sender 0x62cD4935FDb0d76E3Df9096ACa4aa3E020865863 \
  --broadcast \
  --verify \
  --verifier-url https://api-sepolia.basescan.org/api \
  --etherscan-api-key CPZBVWX6UDTIXKFCBMNPM51EKSHGZGEVSP
```

### Create Tribe
```
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "createTribe(string,uint256[3],uint256[3])" "GOATs" "[100, 10, 3]" "[1000000000000000, 5000000000000000, 10000000000000000]" --rpc-url http://127.0.0.1:8545 --account b
```

### Mint Token
```
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "mint(uint8)" "2" --rpc-url http://127.0.0.1:8545 --account b
```