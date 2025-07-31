"use client";

import { useReadContract } from "wagmi";
import { Address, formatEther } from "viem";
import { TribeNFTAbi, TierType } from "../../lib/Tribe";

interface TierInfo {
  name: string;
  type: TierType;
  color: string;
  gradient: string;
  borderColor: string;
}

interface TribeOwnerStatsProps {
  tribeAddress: Address;
  tiers: TierInfo[];
}

export function TribeOwnerStats({ tribeAddress, tiers }: TribeOwnerStatsProps) {
  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--app-foreground)]">Tribe Statistics</h2>
        <div className="text-sm text-[var(--app-foreground-muted)]">
          Owner Dashboard
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <TierStatsCard
            key={tier.type}
            tier={tier}
            tribeAddress={tribeAddress}
          />
        ))}
      </div>
    </div>
  );
}

interface TierStatsCardProps {
  tier: TierInfo;
  tribeAddress: Address;
}

function TierStatsCard({ tier, tribeAddress }: TierStatsCardProps) {
  // Fetch tier data
  const { data: maxSupply } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "maxSupplies",
    args: [BigInt(tier.type)],
  }) as { data: bigint | undefined };

  const { data: currentSupply } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "currentSupplies", 
    args: [BigInt(tier.type)],
  }) as { data: bigint | undefined };

  const { data: price } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "prices",
    args: [BigInt(tier.type)],
  }) as { data: bigint | undefined };

  const remaining = maxSupply && currentSupply ? maxSupply - currentSupply : BigInt(0);
  const priceInEth = price ? formatEther(price) : "0";
  const soldPercentage = maxSupply && maxSupply > 0 
    ? Math.round(Number((currentSupply || BigInt(0)) * BigInt(100) / maxSupply))
    : 0;

  return (
    <div className={`bg-gradient-to-r ${tier.gradient} border ${tier.borderColor} rounded-xl p-6`}>
      {/* Tier Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${tier.color}`}></div>
        <h3 className="text-xl font-bold text-[var(--app-foreground)]">{tier.name} Tier</h3>
      </div>

      {/* Statistics */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--app-foreground-muted)]">Sold:</span>
          <span className="font-semibold text-[var(--app-foreground)]">
            {currentSupply?.toString() || "0"} / {maxSupply?.toString() || "0"}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--app-foreground-muted)]">Remaining:</span>
          <span className="font-semibold text-[var(--app-foreground)]">
            {remaining.toString()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--app-foreground-muted)]">Price:</span>
          <span className="font-semibold text-[var(--app-foreground)]">
            {priceInEth} ETH
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--app-foreground-muted)]">Progress:</span>
          <span className="font-semibold text-[var(--app-foreground)]">
            {soldPercentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-[var(--app-card-border)] rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${tier.color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${soldPercentage}%` }}
          />
        </div>
      </div>

      {/* Revenue Calculation */}
      <div className="mt-4 pt-4 border-t border-current border-opacity-20">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--app-foreground-muted)]">Revenue:</span>
          <span className="font-semibold text-[var(--app-foreground)]">
            {price && currentSupply 
              ? (Number(formatEther(price * currentSupply))).toFixed(4)
              : "0"
            } ETH
          </span>
        </div>
      </div>
    </div>
  );
}