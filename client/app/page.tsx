"use client";

import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { Navbar } from "./components/Navbar";
import { WelcomeHero } from "./components/WelcomeHero";
import { Footer } from "./components/Footer";
import { MyTribes } from "./components/MyTribes";
import { CreateTribeModal } from "./components/CreateTribeModal";
import { TribeFactoryAbi, TribeNFTAbi, tribeFactoryContract } from "../lib/Tribe";

import { Address, parseEther } from "viem";

const TribeCard = ({ address, onTribeClick }: { address: Address; onTribeClick?: (tribeId: string) => void }) => {
  // Fetch tribe name
  const { data: tribeName } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "name",
  });

  // Fetch tribe description
  const { data: tribeDescription } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "description",
  });

  // Fetch max supplies for each tier
  const { data: maxSupplies } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "maxSupplies",
    args: [BigInt(0)], // Bronze
  }) as { data: bigint | undefined };

  const { data: silverMaxSupply } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "maxSupplies",
    args: [BigInt(1)], // Silver
  }) as { data: bigint | undefined };

  const { data: goldMaxSupply } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "maxSupplies",
    args: [BigInt(2)], // Gold
  }) as { data: bigint | undefined };

  // Fetch current supplies for each tier
  const { data: bronzeCurrentSupply } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "currentSupplies",
    args: [BigInt(0)], // Bronze
  }) as { data: bigint | undefined };

  const { data: silverCurrentSupply } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "currentSupplies",
    args: [BigInt(1)], // Silver
  }) as { data: bigint | undefined };

  const { data: goldCurrentSupply } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "currentSupplies",
    args: [BigInt(2)], // Gold
  }) as { data: bigint | undefined };

  // Fetch prices for each tier
  const { data: bronzePrice } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "prices",
    args: [BigInt(0)], // Bronze
  }) as { data: bigint | undefined };

  const { data: silverPrice } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "prices",
    args: [BigInt(1)], // Silver
  }) as { data: bigint | undefined };

  const { data: goldPrice } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "prices",
    args: [BigInt(2)], // Gold
  }) as { data: bigint | undefined };

  // Calculate total supply
  const totalSupply = (maxSupplies || BigInt(0)) + (silverMaxSupply || BigInt(0)) + (goldMaxSupply || BigInt(0));

  // Format prices from wei to ETH
  const formatPrice = (priceInWei: bigint | undefined) => {
    if (!priceInWei) return "0";
    return (Number(priceInWei) / 1e18).toFixed(4);
  };

  return (
    <div
      onClick={() => onTribeClick?.(address)}
      className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 hover:shadow-lg hover:border-[var(--app-accent)]/30 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--app-accent)] to-blue-500 flex items-center justify-center">
            <Icon name="users" size="sm" className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--app-foreground)]">
              {tribeName || "Loading..."}
            </h3>
            <p className="text-sm text-[var(--app-foreground-muted)] mb-1">
              {tribeDescription || "No description"}
            </p>
            <p className="text-xs text-[var(--app-foreground-muted)]">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--app-foreground-muted)]">Total Supply</p>
          <p className="text-lg font-semibold text-[var(--app-foreground)]">
            {totalSupply.toString()}
          </p>
        </div>
      </div>

      {/* Tier Information */}
      <div className="grid grid-cols-3 gap-4">
        {/* Gold Tier */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            <span className="text-sm font-semibold text-[var(--app-foreground)]">Gold</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--app-foreground-muted)]">
              {goldCurrentSupply?.toString() || "0"}/{goldMaxSupply?.toString() || "0"} NFTs
            </p>
            <p className="text-sm font-medium text-[var(--app-foreground)]">
              {formatPrice(goldPrice)} ETH
            </p>
          </div>
        </div>

        {/* Silver Tier */}
        <div className="bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-400/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"></div>
            <span className="text-sm font-semibold text-[var(--app-foreground)]">Silver</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--app-foreground-muted)]">
              {silverCurrentSupply?.toString() || "0"}/{silverMaxSupply?.toString() || "0"} NFTs
            </p>
            <p className="text-sm font-medium text-[var(--app-foreground)]">
              {formatPrice(silverPrice)} ETH
            </p>
          </div>
        </div>

        {/* Bronze Tier */}
        <div className="bg-gradient-to-r from-amber-600/10 to-amber-700/10 border border-amber-600/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-800"></div>
            <span className="text-sm font-semibold text-[var(--app-foreground)]">Bronze</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--app-foreground-muted)]">
              {bronzeCurrentSupply?.toString() || "0"}/{maxSupplies?.toString() || "0"} NFTs
            </p>
            <p className="text-sm font-medium text-[var(--app-foreground)]">
              {formatPrice(bronzePrice)} ETH
            </p>
          </div>
        </div>
      </div>

      {/* Click indicator */}
      <div className="flex items-center justify-center mt-4 pt-4 border-t border-[var(--app-card-border)]">
        <div className="flex items-center space-x-2">
          <p className="text-xs text-[var(--app-foreground-muted)] group-hover:text-[var(--app-accent)] transition-colors">
            Click to view details and manage
          </p>
          <Icon name="arrow-right" size="sm" className="text-[var(--app-foreground-muted)] group-hover:text-[var(--app-accent)] group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};

interface TribeData {
  name: string;
  description: string;
  goldSupply: number;
  goldPrice: number;
  silverSupply: number;
  silverPrice: number;
  bronzeSupply: number;
  bronzePrice: number;
}

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { isConnected, address: userAddress } = useAccount();
  const [frameAdded, setFrameAdded] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [allTribes, setAllTribes] = useState<Address[]>([]);
  const [creatorTribes, setCreatorTribes] = useState<Address[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'created'>('all');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const addFrame = useAddFrame();
  const { writeContract } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch all tribes from the factory contract
  const { data: allTribeAddresses, refetch: refetchAllTribes } = useReadContract({
    address: tribeFactoryContract,
    abi: TribeFactoryAbi,
    functionName: "getTribes",
  });

  // Fetch tribes created by the current user
  const { data: creatorTribeAddresses, refetch: refetchCreatorTribes } = useReadContract({
    address: tribeFactoryContract,
    abi: TribeFactoryAbi,
    functionName: "getCreatorTribes",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress, // Only run when user is connected
    },
  });

  console.log("allTribeAddresses", allTribeAddresses);
  console.log("creatorTribeAddresses", creatorTribeAddresses);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Handle successful tribe creation
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log("Tribe created successfully!");
      // Refetch both tribes lists
      refetchAllTribes();
      refetchCreatorTribes();
      // Reset transaction hash
      setTxHash(undefined);
      // Close modal
      setIsCreateModalOpen(false);
    }
  }, [isConfirmed, txHash, refetchAllTribes, refetchCreatorTribes]);

  // Update all tribes when data is fetched from contract
  useEffect(() => {
    if (allTribeAddresses && Array.isArray(allTribeAddresses)) {
      setAllTribes(allTribeAddresses as Address[]);
    }
  }, [allTribeAddresses]);

  // Update creator tribes when data is fetched from contract
  useEffect(() => {
    if (creatorTribeAddresses && Array.isArray(creatorTribeAddresses)) {
      setCreatorTribes(creatorTribeAddresses as Address[]);
    }
  }, [creatorTribeAddresses]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const handleCreateTribe = useCallback(async (tribeData: TribeData) => {
    try {
      // Convert supplies and prices to the format expected by the contract
      const maxSupplies: readonly [bigint, bigint, bigint] = [
        BigInt(tribeData.bronzeSupply),
        BigInt(tribeData.silverSupply), 
        BigInt(tribeData.goldSupply)
      ];
      
      const prices: readonly [bigint, bigint, bigint] = [
        parseEther(tribeData.bronzePrice.toString()),
        parseEther(tribeData.silverPrice.toString()),
        parseEther(tribeData.goldPrice.toString())
      ];

      // Call the smart contract to create the tribe
      writeContract({
        address: tribeFactoryContract,
        abi: TribeFactoryAbi,
        functionName: "createTribe",
        args: [tribeData.name, tribeData.description, maxSupplies, prices],
      }, {
        onSuccess: (hash) => {
          setTxHash(hash);
          console.log("Transaction submitted:", hash);
        }
      });
      
    } catch (error) {
      console.error("Error creating tribe:", error);
      throw error;
    }
  }, [writeContract]);

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleTribeClick = useCallback((tribeId: string) => {
    // TODO: Navigate to tribe detail page
    // For now, just log the tribe ID
    console.log("Navigating to tribe:", tribeId);
    // In the future, you would navigate to /tribe/${tribeId}
  }, []);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);



  return (
    <>
      <div className={`flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)] ${isCreateModalOpen ? 'blur-sm' : ''}`}>
        {/* New Modern Navbar */}
        <Navbar onCreateTribe={handleOpenCreateModal} />
        
        {/* Main Content */}
        <div className={`flex-1 w-full mx-auto ${!isConnected ? '' : 'max-w-4xl px-4 py-6'}`}>
          {/* Save Frame Button (positioned better) - only show when connected */}
          {isConnected && saveFrameButton && (
            <div className="flex justify-end mb-4">
              {saveFrameButton}
            </div>
          )}

          <main className="flex-1">
            {!isConnected ? (
              <WelcomeHero />
            ) : (
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === 'all'
                          ? 'bg-gradient-to-r from-[var(--app-accent)] to-blue-500 text-white shadow-md'
                          : 'text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] hover:bg-[var(--app-card-bg)]'
                      }`}
                    >
                      All Tribes ({allTribes.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('created')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === 'created'
                          ? 'bg-gradient-to-r from-[var(--app-accent)] to-blue-500 text-white shadow-md'
                          : 'text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] hover:bg-[var(--app-card-bg)]'
                      }`}
                    >
                      My Created Tribes ({creatorTribes.length})
                    </button>
                  </div>
                  
                  <button
                    onClick={handleOpenCreateModal}
                    className="bg-gradient-to-r from-[var(--app-accent)] to-blue-500 hover:from-[var(--app-accent-hover)] hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon name="plus" size="sm" />
                      <span>Create Tribe</span>
                    </div>
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'all' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-[var(--app-foreground)]">All Tribes</h1>
                      <p className="text-[var(--app-foreground-muted)]">
                        Discover and join tribes from the community
                      </p>
                    </div>
                    
                    {allTribes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--app-accent)] to-blue-500 flex items-center justify-center">
                          <Icon name="users" size="lg" className="text-white" />
                        </div>
                        <div className="space-y-3">
                          <h2 className="text-2xl font-bold text-[var(--app-foreground)]">No Tribes Yet</h2>
                          <p className="text-[var(--app-foreground-muted)] max-w-md">
                            Be the first to create a tribe and start building your community!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {allTribes.map((tribeAddress) => (
                          <TribeCard
                            key={tribeAddress}
                            address={tribeAddress}
                            onTribeClick={handleTribeClick}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <MyTribes tribes={creatorTribes} onCreateTribe={handleOpenCreateModal} onTribeClick={handleTribeClick} />
                )}
              </div>
            )}
          </main>

        </div>
        
        {/* Footer - shown for all users */}
        <Footer />
      </div>

      {/* Create Tribe Modal - outside blur container */}
      <CreateTribeModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateTribe={handleCreateTribe}
        isSubmitting={isConfirming}
      />
    </>
  );
}
