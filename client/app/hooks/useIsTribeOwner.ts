import { useAccount, useReadContract } from "wagmi";
import { Address } from "viem";
import { TribeNFTAbi } from "../../lib/Tribe";

export function useIsTribeOwner(tribeAddress: Address) {
  const { address: userAddress, isConnected } = useAccount();

  const { data: tribeOwner, isLoading } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "owner",
    query: {
      enabled: !!tribeAddress && !!isConnected,
    },
  });

  const isOwner = userAddress && tribeOwner && 
    userAddress.toLowerCase() === (tribeOwner as string).toLowerCase();

  return {
    isOwner: !!isOwner,
    tribeOwner: tribeOwner as Address | undefined,
    isLoading,
    isConnected,
  };
}