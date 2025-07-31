import { createPublicClient, http, getContract, Address, Chain } from 'viem';

// Define Base Sepolia testnet configuration
const baseSepoliaTestnet = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
} as const satisfies Chain;

// ABI for the TribeFactory contract
const TRIBE_FACTORY_ABI = [
  {
    inputs: [],
    name: "getTribes",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  }
] as const;

// ABI for the TribeNFT contract
const TRIBE_NFT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getMemberTiers",
    outputs: [
      {
        internalType: "uint256[3]",
        name: "",
        type: "uint256[3]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  }
] as const;

// Create a public client for Base Sepolia
const client = createPublicClient({
  chain: baseSepoliaTestnet,
  transport: http()
});

// Function to get all tribes from the factory
export async function getUserTribes(factoryAddress: string, userAddress: string): Promise<string[]> {
  const contract = getContract({
    address: factoryAddress as Address,
    abi: TRIBE_FACTORY_ABI,
    client
  });

  try {
    const tribes = await contract.read.getTribes();
    console.log('Tribes:', tribes);
    return tribes as string[];
  } catch (error) {
    console.error('Error fetching user tribes:', error);
    throw error;
  }
}

// Function to get member tiers for a user from a specific tribe contract
export async function getMemberTiers(tribeContractAddress: string, userAddress: string): Promise<readonly [bigint, bigint, bigint]> {
  const contract = getContract({
    address: tribeContractAddress as Address,
    abi: TRIBE_NFT_ABI,
    client
  });

  try {
    const tiers = await contract.read.getMemberTiers([userAddress as Address]);
    console.log('Member tiers for address:', userAddress, 'in tribe:', tribeContractAddress, ':', tiers);
    return tiers;
  } catch (error) {
    console.error('Error fetching member tiers:', error);
    throw error;
  }
}

// Function to get tribe name and description
export async function getTribeDetails(tribeContractAddress: string): Promise<{ name: string; description: string }> {
  const contract = getContract({
    address: tribeContractAddress as Address,
    abi: TRIBE_NFT_ABI,
    client
  });

  try {
    const [name, description] = await Promise.all([
      contract.read.name(),
      contract.read.description()
    ]);
    return { name, description };
  } catch (error) {
    console.error('Error fetching tribe details:', error);
    throw error;
  }
} 