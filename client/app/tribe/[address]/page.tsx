"use client";

import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Address, formatEther } from "viem";
import { useState, useEffect } from "react";
import { TribeNFTAbi, TierType, Listing } from "../../../lib/Tribe";
import { Button, Icon } from "../../components/DemoComponents";
import { useIsTribeOwner } from "../../hooks/useIsTribeOwner";
import { CreatePostSection } from "../../components/CreatePostSection";
import { TribeOwnerStats } from "../../components/TribeOwnerStats";
import { ListTokenModal } from "../../components/ListTokenModal";

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

interface PostData {
  content: string;
  allowedTiers: TierType[];
}

export default function TribePage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address: userAddress } = useAccount();
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Marketplace state
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedTokenForListing, setSelectedTokenForListing] = useState<{
    tokenId: number;
    tierName: string;
  } | null>(null);
  const [marketplaceRefetch, setMarketplaceRefetch] = useState(0);

  const tribeAddress = params.address as Address;
  const { writeContract } = useWriteContract();
  const { isOwner, isLoading: isOwnerLoading } = useIsTribeOwner(tribeAddress);

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

  // Fetch marketplace data
  const { data: activeListings, refetch: refetchListings } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "getActiveListings",
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  }) as { data: readonly bigint[] | undefined; refetch: () => void };

  // Handle successful mint
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log("NFT minted successfully!");
      setTxHash(undefined);
      setSelectedTier(null);
      
      // Immediate refetch
      refetchUserNFTs();
      setRefetchTrigger(prev => prev + 1);
      
      // Additional refetch after a short delay to ensure blockchain data is updated
      setTimeout(() => {
        refetchUserNFTs();
        setRefetchTrigger(prev => prev + 1);
      }, 1000);
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

  const handleCreatePost = async (postData: PostData) => {
    setIsCreatingPost(true);
    try {
      const response = await fetch('https://tribe-jet-beta.vercel.app/api/benefit/multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tribe: tribeAddress,
          benefit_text: postData.content,
          tiers: postData.allowedTiers
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create post: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Post created successfully:", result);

    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Marketplace handlers
  const handleListToken = (tokenId: number, tierType: TierType, tierName: string) => {
    setSelectedTokenForListing({ tokenId, tierName });
    setIsListModalOpen(true);
  };

  const handleBuyToken = async (tokenId: bigint, price: bigint) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      writeContract({
        address: tribeAddress,
        abi: TribeNFTAbi,
        functionName: "buyToken",
        args: [tokenId],
        value: price,
      }, {
        onSuccess: (hash) => {
          console.log("Buy token transaction submitted:", hash);
          // Refresh marketplace data
          refetchListings();
          refetchUserNFTs();
          setMarketplaceRefetch(prev => prev + 1);
        },
        onError: (error) => {
          console.error("Buy token failed:", error);
          alert("Failed to buy token: " + error.message);
        }
      });
    } catch (error) {
      console.error("Error buying token:", error);
      alert("Error buying token: " + (error as Error).message);
    }
  };

  const handleListingSuccess = () => {
    refetchListings();
    refetchUserNFTs();
    setMarketplaceRefetch(prev => prev + 1);
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
            <Button
              onClick={() => router.push(`/tribe/${tribeAddress}/content`)}
              variant="primary"
              size="md"
              className="flex items-center space-x-2"
            >
              <Icon name="star" size="sm" />
              <span>View Content</span>
            </Button>
          </div>
        </div>

        {/* Conditional Content Based on Ownership */}
        {isOwnerLoading ? (
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 mb-8">
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[var(--app-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[var(--app-foreground-muted)]">Loading...</p>
            </div>
          </div>
        ) : isOwner ? (
          /* Owner View */
          <>
            {/* Tribe Owner Statistics */}
            <TribeOwnerStats tribeAddress={tribeAddress} tiers={tiers} />
            
            {/* Post Creation Section */}
            <CreatePostSection 
              tiers={tiers}
              onCreatePost={handleCreatePost}
              isSubmitting={isCreatingPost}
            />
          </>
        ) : (
          /* Regular User View */
          <>
            {/* User's NFTs Section */}
            {isConnected && userAddress && (
              <UserNFTsSection 
                userMemberTiers={userMemberTiers}
                userBalance={userBalance}
                tiers={tiers}
                tribeAddress={tribeAddress}
                userAddress={userAddress}
                onListToken={handleListToken}
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
                    refetchTrigger={refetchTrigger}
                  />
                ))}
              </div>
            </div>

            {/* After Market Section */}
            <AfterMarketSection
              tribeAddress={tribeAddress}
              activeListings={activeListings}
              userAddress={userAddress}
              tiers={tiers}
              onBuyToken={handleBuyToken}
              refetchTrigger={marketplaceRefetch}
            />
          </>
        )}

        {/* Connection Message - Only for non-owners */}
        {!isConnected && !isOwner && (
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

      {/* List Token Modal */}
      {selectedTokenForListing && (
        <ListTokenModal
          isOpen={isListModalOpen}
          onClose={() => {
            setIsListModalOpen(false);
            setSelectedTokenForListing(null);
          }}
          tokenId={selectedTokenForListing.tokenId}
          tierName={selectedTokenForListing.tierName}
          tribeAddress={tribeAddress}
          onSuccess={handleListingSuccess}
        />
      )}
    </div>
  );
}

interface UserNFTsSectionProps {
  userMemberTiers: readonly [bigint, bigint, bigint] | undefined;
  userBalance: bigint | undefined;
  tiers: TierInfo[];
  tribeAddress: Address;
  userAddress: Address;
  onListToken: (tokenId: number, tierType: TierType, tierName: string) => void;
}

function UserNFTsSection({ userMemberTiers, userBalance, tiers, tribeAddress, userAddress, onListToken }: UserNFTsSectionProps) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: totalNFTs }, (_, index) => (
          <UserTokenCard
            key={index}
            tokenIndex={index}
            tribeAddress={tribeAddress}
            userAddress={userAddress}
            tiers={tiers}
            onListToken={onListToken}
          />
        ))}
      </div>

      {/* Summary by tier */}
      <div className="mt-6 pt-6 border-t border-[var(--app-card-border)]">
        <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-4">Membership Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier, index) => {
            const count = userMemberTiers ? Number(userMemberTiers[index]) : 0;
            
            return (
              <div 
                key={tier.type}
                className={`bg-gradient-to-r ${tier.gradient} border ${tier.borderColor} rounded-lg p-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${tier.color}`}></div>
                    <span className="font-medium text-[var(--app-foreground)]">{tier.name}</span>
                  </div>
                  <span className="text-lg font-bold text-[var(--app-foreground)]">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface UserTokenCardProps {
  tokenIndex: number;
  tribeAddress: Address;
  userAddress: Address;
  tiers: TierInfo[];
  onListToken: (tokenId: number, tierType: TierType, tierName: string) => void;
}

function UserTokenCard({ tokenIndex, tribeAddress, userAddress, tiers, onListToken }: UserTokenCardProps) {
  // Fetch token ID for this index
  const { data: tokenId } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "tokenOfOwnerByIndex",
    args: [userAddress, BigInt(tokenIndex)],
  }) as { data: bigint | undefined };

  // Fetch token tier
  const { data: tokenTier } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "tokenTiers",
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId },
  }) as { data: number | undefined };

  if (!tokenId || tokenTier === undefined) {
    return (
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-[var(--app-card-border)] rounded mb-2"></div>
        <div className="h-8 bg-[var(--app-card-border)] rounded"></div>
      </div>
    );
  }

  const tierInfo = tiers[tokenTier];

  return (
    <div
      className={`bg-gradient-to-r ${tierInfo.gradient} border ${tierInfo.borderColor} rounded-lg p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${tierInfo.color}`}></div>
          <span className="font-semibold text-[var(--app-foreground)]">{tierInfo.name}</span>
        </div>
        <span className="text-sm font-mono text-[var(--app-foreground-muted)]">#{Number(tokenId)}</span>
      </div>
      
      <UserTokenCardListingCheck
        tokenId={Number(tokenId)}
        tokenTier={tokenTier as TierType}
        tierInfo={tierInfo}
        tribeAddress={tribeAddress}
        onListToken={onListToken}
      />
    </div>
  );
}

interface UserTokenCardListingCheckProps {
  tokenId: number;
  tokenTier: TierType;
  tierInfo: TierInfo;
  tribeAddress: Address;
  onListToken: (tokenId: number, tierType: TierType, tierName: string) => void;
}

function UserTokenCardListingCheck({ tokenId, tokenTier, tierInfo, tribeAddress, onListToken }: UserTokenCardListingCheckProps) {
  // Fetch active listings to check if this specific token is already listed
  const { data: activeListings } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "getActiveListings",
  }) as { data: readonly bigint[] | undefined };

  // Check if this specific token ID is already in the active listings
  const isTokenListed = activeListings 
    ? activeListings.some(listingTokenId => Number(listingTokenId) === tokenId)
    : false;

  if (isTokenListed) {
    return (
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 text-center">
        <p className="text-xs text-yellow-800 font-medium">
          Token already listed
        </p>
      </div>
    );
  }

  return (
    <Button
      onClick={() => onListToken(tokenId, tokenTier, tierInfo.name)}
      variant="secondary"
      size="sm"
      className="w-full"
    >
      List for Sale
    </Button>
  );
}

interface TierCardProps {
  tier: TierInfo;
  tribeAddress: Address;
  onMint: (tier: TierType, price: bigint) => void;
  isLoading: boolean;
  disabled: boolean;
  refetchTrigger: number;
}

function TierCard({ tier, tribeAddress, onMint, isLoading, disabled, refetchTrigger }: TierCardProps) {
  // Fetch tier data
  const { data: maxSupply, isLoading: maxSupplyLoading, refetch: refetchMaxSupply } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "maxSupplies",
    args: [BigInt(tier.type)],
  }) as { data: bigint | undefined; isLoading: boolean; refetch: () => void };

  const { data: currentSupply, isLoading: currentSupplyLoading, refetch: refetchCurrentSupply } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "currentSupplies", 
    args: [BigInt(tier.type)],
  }) as { data: bigint | undefined; isLoading: boolean; refetch: () => void };

  const { data: price, isLoading: priceLoading, refetch: refetchPrice } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "prices",
    args: [BigInt(tier.type)],
  }) as { data: bigint | undefined; isLoading: boolean; refetch: () => void };

  // Refetch tier data when refetchTrigger changes
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetchMaxSupply();
      refetchCurrentSupply();
      refetchPrice();
    }
  }, [refetchTrigger, refetchMaxSupply, refetchCurrentSupply, refetchPrice]);



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

interface AfterMarketSectionProps {
  tribeAddress: Address;
  activeListings: readonly bigint[] | undefined;
  userAddress: Address | undefined;
  tiers: TierInfo[];
  onBuyToken: (tokenId: bigint, price: bigint) => void;
  refetchTrigger: number;
}

function AfterMarketSection({ tribeAddress, activeListings, userAddress, tiers, onBuyToken, refetchTrigger }: AfterMarketSectionProps) {
  if (!activeListings || activeListings.length === 0) {
    return (
      <div className="space-y-6 mt-6">
        <h2 className="text-2xl font-bold text-[var(--app-foreground)]">After Market</h2>
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6">
          <div className="text-center py-8">
            <Icon name="wallet" size="lg" className="text-[var(--app-foreground-muted)] mx-auto mb-3" />
            <p className="text-[var(--app-foreground-muted)]">
              No NFTs are currently listed for sale in this tribe.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-bold text-[var(--app-foreground)]">After Market</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeListings.map((tokenId) => (
          <MarketplaceCard
            key={Number(tokenId)}
            tokenId={tokenId}
            tribeAddress={tribeAddress}
            userAddress={userAddress}
            tiers={tiers}
            onBuyToken={onBuyToken}
            refetchTrigger={refetchTrigger}
          />
        ))}
      </div>
    </div>
  );
}

interface MarketplaceCardProps {
  tokenId: bigint;
  tribeAddress: Address;
  userAddress: Address | undefined;
  tiers: TierInfo[];
  onBuyToken: (tokenId: bigint, price: bigint) => void;
  refetchTrigger: number;
}

function MarketplaceCard({ tokenId, tribeAddress, userAddress, tiers, onBuyToken, refetchTrigger }: MarketplaceCardProps) {
  // Fetch listing details
  const { data: listing, refetch: refetchListing } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "getListing",
    args: [tokenId],
  }) as { data: Listing | undefined; refetch: () => void };

  // Fetch token tier
  const { data: tokenTier } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "tokenTiers",
    args: [tokenId],
  }) as { data: number | undefined };

  // Refetch when refetchTrigger changes
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetchListing();
    }
  }, [refetchTrigger, refetchListing]);

  if (!listing || !listing.active || tokenTier === undefined) {
    return null;
  }

  // Check if listing is expired
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = Number(listing.expiration) <= currentTime;
  
  if (isExpired) {
    return null;
  }

  const tierInfo = tiers[tokenTier];
  const isOwnListing = userAddress && listing.seller.toLowerCase() === userAddress.toLowerCase();
  const priceInEth = formatEther(listing.price);

  return (
    <div className={`bg-gradient-to-r ${tierInfo.gradient} border ${tierInfo.borderColor} rounded-xl p-6 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${tierInfo.color}`}></div>
          <div>
            <h3 className="text-lg font-bold text-[var(--app-foreground)]">{tierInfo.name} NFT</h3>
            <p className="text-sm font-mono text-[var(--app-foreground-muted)]">#{Number(tokenId)}</p>
          </div>
        </div>
      </div>

      {/* Price and seller */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[var(--app-foreground-muted)]">Price:</span>
          <span className="text-xl font-bold text-[var(--app-foreground)]">{priceInEth} ETH</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--app-foreground-muted)]">Seller:</span>
          <span className="text-sm font-mono text-[var(--app-foreground)]">
            {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--app-foreground-muted)]">Expires:</span>
          <span className="text-sm text-[var(--app-foreground)]">
            {new Date(Number(listing.expiration) * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Buy button */}
      {isOwnListing ? (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
          <p className="text-sm text-yellow-800 font-medium">Your Listing</p>
        </div>
      ) : (
        <Button
          onClick={() => onBuyToken(tokenId, listing.price)}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!userAddress}
        >
          {!userAddress ? "Connect Wallet" : `Buy for ${priceInEth} ETH`}
        </Button>
      )}
    </div>
  );
}