"use client";

import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Address, formatEther } from "viem";
import { useState, useEffect } from "react";
import { TribeNFTAbi, TierType } from "../../../lib/Tribe";
import { Button, Icon } from "../../components/DemoComponents";

interface TierInfo {
  name: string;
  type: TierType;
  color: string;
  gradient: string;
  borderColor: string;
}

const tiers: TierInfo[] = [
  {
    name: "Bronze",
    type: TierType.Bronze,
    color: "from-amber-600 to-amber-800",
    gradient: "from-amber-600/10 to-amber-700/10",
    borderColor: "border-amber-600/20",
  },
  {
    name: "Silver", 
    type: TierType.Silver,
    color: "from-gray-400 to-gray-600",
    gradient: "from-gray-400/10 to-gray-500/10",
    borderColor: "border-gray-400/20",
  },
  {
    name: "Gold",
    type: TierType.Gold,
    color: "from-yellow-400 to-yellow-600", 
    gradient: "from-yellow-500/10 to-yellow-600/10",
    borderColor: "border-yellow-500/20",
  },
];

export default function TribePage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address: userAddress } = useAccount();
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const tribeAddress = params.address as Address;
  const { writeContract } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch tribe basic info
  const { data: tribeName } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "name",
  });

  const { data: tribeDescription } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "description",
  });

  const { data: tribeOwner } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "owner",
  });

  // Fetch user's NFTs from this tribe
  const { data: userMemberTiers, refetch: refetchUserNFTs } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "getMemberTiers",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!isConnected,
    },
  }) as { data: readonly [bigint, bigint, bigint] | undefined; refetch: () => void };

  const { data: userBalance } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!isConnected,
    },
  }) as { data: bigint | undefined };

  // Handle successful mint
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log("NFT minted successfully!");
      setTxHash(undefined);
      setSelectedTier(null);
      // Refetch user's NFTs after successful mint
      refetchUserNFTs();
    }
  }, [isConfirmed, txHash, refetchUserNFTs]);

  const handleMint = async (tier: TierType, price: bigint) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setSelectedTier(tier);
      writeContract({
        address: tribeAddress,
        abi: TribeNFTAbi,
        functionName: "mint",
        args: [tier],
        value: price,
      }, {
        onSuccess: (hash) => {
          setTxHash(hash);
          console.log("Mint transaction submitted:", hash);
        },
        onError: (error) => {
          console.error("Mint failed:", error);
          setSelectedTier(null);
        }
      });
    } catch (error) {
      console.error("Error minting NFT:", error);
      setSelectedTier(null);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!tribeAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--app-foreground-muted)]">Invalid tribe address</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--app-background)] to-[var(--app-gray)] font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors"
          >
            <span className="transform rotate-180"><Icon name="arrow-right" size="sm" /></span>
            <span>Back</span>
          </button>
        </div>

        {/* Tribe Info */}
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--app-accent)] to-blue-500 flex items-center justify-center">
              <Icon name="users" size="lg" className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[var(--app-foreground)] mb-2">
                {tribeName || "Loading..."}
              </h1>
              <p className="text-[var(--app-foreground-muted)] mb-3">
                {tribeDescription || "No description available"}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Contract:</span>
                  <span className="ml-2 font-mono text-[var(--app-foreground)]">
                    {tribeAddress.slice(0, 6)}...{tribeAddress.slice(-4)}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Creator:</span>
                  <span className="ml-2 font-mono text-[var(--app-foreground)]">
                    {tribeOwner ? `${(tribeOwner as string).slice(0, 6)}...${(tribeOwner as string).slice(-4)}` : "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's NFTs Section */}
        {isConnected && userAddress && (
          <UserNFTsSection 
            userMemberTiers={userMemberTiers}
            userBalance={userBalance}
            tiers={tiers}
          />
        )}

        {/* NFT Tiers */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--app-foreground)]">Available NFT Tiers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <TierCard
                key={tier.type}
                tier={tier}
                tribeAddress={tribeAddress}
                onMint={handleMint}
                isLoading={isConfirming && selectedTier === tier.type}
                disabled={!isConnected || isConfirming}
              />
            ))}
          </div>
        </div>

        {/* Connection Message */}
        {!isConnected && (
          <div className="mt-8 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 text-center">
            <Icon name="wallet" size="lg" className="text-[var(--app-foreground-muted)] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              Connect Wallet to Mint
            </h3>
            <p className="text-[var(--app-foreground-muted)]">
              Please connect your wallet to mint NFTs from this tribe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface UserNFTsSectionProps {
  userMemberTiers: readonly [bigint, bigint, bigint] | undefined;
  userBalance: bigint | undefined;
  tiers: TierInfo[];
}

function UserNFTsSection({ userMemberTiers, userBalance, tiers }: UserNFTsSectionProps) {
  const totalNFTs = userBalance ? Number(userBalance) : 0;
  
  if (totalNFTs === 0) {
    return (
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-[var(--app-foreground)] mb-4">Your NFTs</h2>
        <div className="text-center py-8">
          <Icon name="wallet" size="lg" className="text-[var(--app-foreground-muted)] mx-auto mb-3" />
          <p className="text-[var(--app-foreground-muted)]">
            You don&apos;t own any NFTs from this tribe yet. Mint your first NFT below!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--app-foreground)]">Your NFTs</h2>
        <div className="text-right">
          <p className="text-sm text-[var(--app-foreground-muted)]">Total Owned</p>
          <p className="text-lg font-semibold text-[var(--app-foreground)]">{totalNFTs}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, index) => {
          const count = userMemberTiers ? Number(userMemberTiers[index]) : 0;
          
          return (
            <div 
              key={tier.type}
              className={`bg-gradient-to-r ${tier.gradient} border ${tier.borderColor} rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${tier.color}`}></div>
                  <span className="font-semibold text-[var(--app-foreground)]">{tier.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[var(--app-foreground)]">{count}</span>
                  <p className="text-xs text-[var(--app-foreground-muted)]">owned</p>
                </div>
              </div>
              
              {count > 0 && (
                <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                  <p className="text-xs text-[var(--app-foreground-muted)]">
                    You are a {tier.name} member of this tribe!
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TierCardProps {
  tier: TierInfo;
  tribeAddress: Address;
  onMint: (tier: TierType, price: bigint) => void;
  isLoading: boolean;
  disabled: boolean;
}

function TierCard({ tier, tribeAddress, onMint, isLoading, disabled }: TierCardProps) {
  // Fetch tier data
  const { data: maxSupply, isLoading: maxSupplyLoading } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "maxSupplies",
    args: [BigInt(tier.type)],
  }) as { data: bigint | undefined; isLoading: boolean };

  const { data: currentSupply, isLoading: currentSupplyLoading } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "currentSupplies", 
    args: [BigInt(tier.type)],
  }) as { data: bigint | undefined; isLoading: boolean };

  const { data: price, isLoading: priceLoading } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "prices",
    args: [BigInt(tier.type)],
  }) as { data: bigint | undefined; isLoading: boolean };



  // Calculate availability - only if we have valid data
  const available = (maxSupply !== undefined && currentSupply !== undefined) 
    ? maxSupply - currentSupply 
    : undefined;
  
  // Only consider sold out if we have valid data and available is actually 0
  const isSoldOut = available !== undefined && maxSupply !== undefined && maxSupply > 0 && available === BigInt(0);
  const priceInEth = price ? formatEther(price) : "0";
  
  // Check if we're still loading data
  const isDataLoading = maxSupplyLoading || currentSupplyLoading || priceLoading;

  return (
    <div className={`bg-gradient-to-r ${tier.gradient} border ${tier.borderColor} rounded-xl p-6 space-y-4`}>
      {/* Tier Header */}
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${tier.color}`}></div>
        <h3 className="text-xl font-bold text-[var(--app-foreground)]">{tier.name} Tier</h3>
      </div>

      {/* Supply Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[var(--app-foreground-muted)]">Available:</span>
          <span className="font-semibold text-[var(--app-foreground)]">
            {isDataLoading ? "Loading..." : 
             available !== undefined ? `${available.toString()} / ${maxSupply?.toString() || "0"}` : 
             "Loading..."}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--app-foreground-muted)]">Price:</span>
          <span className="font-semibold text-[var(--app-foreground)]">
            {isDataLoading ? "Loading..." : `${priceInEth} ETH`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--app-card-border)] rounded-full h-2">
        <div
          className={`bg-gradient-to-r ${tier.color} h-2 rounded-full transition-all duration-300`}
          style={{
            width: maxSupply && maxSupply > 0 && currentSupply !== undefined
              ? `${Math.min(100, Number(currentSupply * BigInt(100) / maxSupply))}%`
              : "0%"
          }}
        />
      </div>

      {/* Mint Button */}
      <Button
        onClick={() => price && onMint(tier.type, price)}
        disabled={disabled || isSoldOut || isDataLoading || !price}
        variant={isSoldOut ? "secondary" : "primary"}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Minting...</span>
          </div>
        ) : isDataLoading ? (
          "Loading..."
        ) : isSoldOut ? (
          "Sold Out"
        ) : !price ? (
          "Loading Price..."
        ) : (
          `Mint ${tier.name} NFT`
        )}
      </Button>
    </div>
  );
}