"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { TribeNFTAbi } from "../../lib/Tribe";
import { Button, Icon } from "./DemoComponents";

interface ListTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  tierName: string;
  tribeAddress: `0x${string}`;
  onSuccess: () => void;
}

export function ListTokenModal({
  isOpen,
  onClose,
  tokenId,
  tierName,
  tribeAddress,
  onSuccess,
}: ListTokenModalProps) {
  const [price, setPrice] = useState("");
  const [expiration, setExpiration] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!price || !expiration) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const priceInWei = parseEther(price);
      const expirationTimestamp = BigInt(Math.floor(new Date(expiration).getTime() / 1000));

      writeContract({
        address: tribeAddress,
        abi: TribeNFTAbi,
        functionName: "listToken",
        args: [BigInt(tokenId), priceInWei, expirationTimestamp],
      }, {
        onSuccess: (hash) => {
          setTxHash(hash);
          console.log("List token transaction submitted:", hash);
        },
        onError: (error) => {
          console.error("List token failed:", error);
          alert("Failed to list token: " + error.message);
        }
      });
    } catch (error) {
      console.error("Error listing token:", error);
      alert("Error listing token: " + (error as Error).message);
    }
  };

  const handleClose = () => {
    if (!isConfirming) {
      setPrice("");
      setExpiration("");
      setTxHash(undefined);
      onClose();
    }
  };

  // Handle successful listing
  if (isConfirmed && txHash) {
    setTimeout(() => {
      handleClose();
      onSuccess();
    }, 1000);
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--app-accent)] to-blue-500 flex items-center justify-center">
              <Icon name="plus" size="sm" className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-[var(--app-foreground)]">
              List {tierName} NFT #{tokenId}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isConfirming}
            className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors disabled:opacity-50"
          >
            <Icon name="plus" size="sm" className="transform rotate-45" />
          </button>
        </div>

        {isConfirmed ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="check" size="lg" className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              Token Listed Successfully!
            </h3>
            <p className="text-[var(--app-foreground-muted)] text-sm">
              Your {tierName} NFT #{tokenId} is now available for purchase.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                Price (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.01"
                disabled={isConfirming}
                className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] disabled:opacity-50"
                required
              />
              <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
                Set your asking price in ETH
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                Listing Expiration
              </label>
              <input
                type="date"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                min={today}
                disabled={isConfirming}
                className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] disabled:opacity-50"
                required
              />
              <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
                When should this listing expire?
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                size="md"
                className="flex-1"
                disabled={isConfirming}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="flex-1"
                disabled={isConfirming || !price || !expiration}
              >
                {isConfirming ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Listing...</span>
                  </div>
                ) : (
                  "List Token"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}