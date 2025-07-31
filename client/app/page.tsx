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
import { TribeFactoryAbi, tribeFactoryContract } from "../lib/Tribe";

import { Address, parseEther } from "viem";

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
  const { isConnected } = useAccount();
  const [frameAdded, setFrameAdded] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tribes, setTribes] = useState<Address[]>([]);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const addFrame = useAddFrame();
  const { writeContract } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch all tribes from the factory contract
  const { data: tribeAddresses, refetch: refetchTribes } = useReadContract({
    address: tribeFactoryContract,
    abi: TribeFactoryAbi,
    functionName: "getTribes",
  });

  console.log("tribeAddresses", tribeAddresses);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Handle successful tribe creation
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log("Tribe created successfully!");
      // Refetch tribes list
      refetchTribes();
      // Reset transaction hash
      setTxHash(undefined);
      // Close modal
      setIsCreateModalOpen(false);
    }
  }, [isConfirmed, txHash, refetchTribes]);

  // Update tribes when data is fetched from contract
  useEffect(() => {
    if (tribeAddresses && Array.isArray(tribeAddresses)) {
      setTribes(tribeAddresses as Address[]);
    }
  }, [tribeAddresses]);

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
              <MyTribes tribes={tribes} onCreateTribe={handleOpenCreateModal} onTribeClick={handleTribeClick} />
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
