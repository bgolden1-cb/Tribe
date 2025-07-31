"use client";

import { Address } from "viem";
import { Icon } from "./DemoComponents";
import { useReadContract } from "wagmi";
import { TribeNFTAbi } from "@/lib/Tribe";



interface MyTribesProps {
  tribes: Address[];
  onCreateTribe: () => void;
  onTribeClick?: (tribeId: string) => void;
}

export function MyTribes({ tribes, onCreateTribe, onTribeClick }: MyTribesProps) {
  if (tribes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--app-accent)] to-blue-500 flex items-center justify-center">
          <Icon name="users" size="lg" className="text-white" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-[var(--app-foreground)]">
            No Tribes Yet
          </h2>
          <p className="text-[var(--app-foreground-muted)] max-w-md">
            Create your first tribe to start building your community and selling NFTs to your followers. Click on any tribe to view details and manage it.
          </p>
        </div>

        <button
          onClick={onCreateTribe}
          className="bg-gradient-to-r from-[var(--app-accent)] to-blue-500 hover:from-[var(--app-accent-hover)] hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <div className="flex items-center space-x-2">
            <Icon name="plus" size="sm" />
            <span>Create Your First Tribe</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--app-foreground)]">My Tribes</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tribes.map((tribeAddress) => (
          <TribeCard
            key={tribeAddress}
            address={tribeAddress}
            onTribeClick={onTribeClick}
          />
        ))}
      </div>
    </div>
  );
}

const TribeCard = ({ address, onTribeClick }: { address: Address; onTribeClick?: (tribeId: string) => void }) => {
  // Fetch tribe name
  const { data: tribeName } = useReadContract({
    address: address,
    abi: TribeNFTAbi,
    functionName: "name",
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
            <p className="text-sm text-[var(--app-foreground-muted)]">
              Contract: {address.slice(0, 6)}...{address.slice(-4)}
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