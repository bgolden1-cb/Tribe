"use client";

import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { Address } from "viem";
import { useState, useEffect } from "react";
import { TribeNFTAbi, TierType } from "../../../../lib/Tribe";
import { Button, Icon } from "../../../components/DemoComponents";

interface BenefitsResponse {
  tribe: {
    address: string;
  };
  tierCounts: string[];
  benefits: {
    [key: string]: string[];
  };
}

const tierInfo = [
  {
    name: "Bronze",
    type: TierType.Bronze,
    color: "from-amber-600 to-amber-800",
    gradient: "from-amber-600/10 to-amber-700/10",
    borderColor: "border-amber-600/20",
    title: "Bronze Member Exclusive Content",
    description: "Welcome to the Bronze tier! Access foundational knowledge and community updates."
  },
  {
    name: "Silver",
    type: TierType.Silver,
    color: "from-gray-400 to-gray-600",
    gradient: "from-gray-400/10 to-gray-500/10",
    borderColor: "border-gray-400/20",
    title: "Silver Member Premium Content",
    description: "Silver tier members enjoy advanced insights, exclusive tutorials, and priority support."
  },
  {
    name: "Gold",
    type: TierType.Gold,
    color: "from-yellow-400 to-yellow-600",
    gradient: "from-yellow-500/10 to-yellow-600/10",
    borderColor: "border-yellow-500/20",
    title: "Gold Member Elite Content",
    description: "The ultimate tier with exclusive access to insider information, private events, and direct leadership contact."
  }
];

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address: userAddress } = useAccount();
  const [benefitsData, setBenefitsData] = useState<BenefitsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tribeAddress = params.address as Address;

  // Fetch tribe basic info
  const { data: tribeName } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "name",
  });



  // Fetch benefits data from API
  useEffect(() => {
    if (tribeAddress && userAddress && isConnected) {
      setIsLoading(true);
      setError(null);
      
      fetch(`http://localhost:4000/api/benefits?contract=${tribeAddress}&address=${userAddress}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch benefits');
          }
          return res.json();
        })
        .then(data => {
          setBenefitsData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching benefits:', err);
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [tribeAddress, userAddress, isConnected]);

  const handleGoBack = () => {
    router.back();
  };

  // Check if user has access to a specific tier
  const hasAccess = (tierType: TierType): boolean => {
    if (!benefitsData || !benefitsData.tierCounts) return false;
    return Number(benefitsData.tierCounts[tierType]) > 0;
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
            <span>Back to Tribe</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--app-accent)] to-blue-500 flex items-center justify-center">
              <Icon name="star" size="md" className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--app-foreground)] mb-1">
                {tribeName} Content
              </h1>
              <p className="text-[var(--app-foreground-muted)]">
                Exclusive content for tribe members based on your tier membership
              </p>
            </div>
          </div>
        </div>

        {/* Connection Message */}
        {!isConnected && (
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 text-center mb-8">
            <Icon name="wallet" size="lg" className="text-[var(--app-foreground-muted)] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              Connect Wallet to View Content
            </h3>
            <p className="text-[var(--app-foreground-muted)]">
              Please connect your wallet to access tier-specific content.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isConnected && isLoading && (
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-8 text-center">
            <p className="text-[var(--app-foreground-muted)]">Loading benefits...</p>
          </div>
        )}

        {/* Error State */}
        {isConnected && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Benefits</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tier Content */}
        {isConnected && !isLoading && !error && (
          <div className="space-y-8">
            {tierInfo.map((tier) => (
              <TierContentCard
                key={tier.type}
                tierInfo={tier}
                hasAccess={hasAccess(tier.type)}
                benefits={benefitsData?.benefits?.[tier.type.toString()] || []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TierContentCardProps {
  tierInfo: typeof tierInfo[0];
  hasAccess: boolean;
  benefits: string[];
}

function TierContentCard({ tierInfo, hasAccess, benefits }: TierContentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gradient-to-r ${tierInfo.gradient} border ${tierInfo.borderColor} rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className="p-6 border-b border-current border-opacity-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${tierInfo.color}`}></div>
            <div>
              <h2 className="text-xl font-bold text-[var(--app-foreground)]">
                {tierInfo.title}
              </h2>
              <p className="text-[var(--app-foreground-muted)] text-sm">
                {tierInfo.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {hasAccess ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Icon name="check" size="sm" />
                <span className="text-sm font-semibold">Access Granted</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-500">
                <Icon name="plus" size="sm" className="transform rotate-45" />
                <span className="text-sm font-semibold">Locked</span>
              </div>
            )}
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-1"
            >
              <span>{isExpanded ? "Collapse" : "Expand"}</span>
              <Icon 
                name="arrow-right" 
                size="sm" 
                className={`transform transition-transform ${isExpanded ? "rotate-90" : ""}`} 
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {hasAccess ? (
            <div className="space-y-4">
              {benefits.length > 0 ? (
                benefits.map((benefit, index) => (
                  <PostCard 
                    key={index} 
                    content={benefit} 
                    index={index}
                    tierColor={tierInfo.color}
                    tierName={tierInfo.name}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--app-gray)] flex items-center justify-center">
                    <Icon name="star" size="lg" className="text-[var(--app-foreground-muted)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--app-foreground)] mb-2">
                    No Posts Yet
                  </h3>
                  <p className="text-[var(--app-foreground-muted)] max-w-md mx-auto">
                    No exclusive content has been posted for this tier yet. Check back later for amazing content!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="plus" size="lg" className="text-red-500 transform rotate-45" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--app-foreground)] mb-2">
                {tierInfo.name} Tier Required
              </h3>
              <p className="text-[var(--app-foreground-muted)] mb-6 max-w-md mx-auto">
                You need to own at least one {tierInfo.name} NFT to access this exclusive content.
              </p>
              <Button
                onClick={() => window.history.back()}
                variant="primary"
                size="md"
                className="px-6"
              >
                <Icon name="wallet" size="sm" className="mr-2" />
                Mint {tierInfo.name} NFT
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PostCardProps {
  content: string;
  index: number;
  tierColor: string;
  tierName: string;
}

function PostCard({ content, index, tierColor, tierName }: PostCardProps) {
  // Generate a pseudo-random date for demo purposes (you can replace with actual timestamps later)
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Get first 150 characters for preview if content is long
  const isLong = content.length > 150;
  const preview = isLong ? content.substring(0, 150) + '...' : content;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${tierColor} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">
                {tierName.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--app-foreground)]">
                {tierName} Exclusive
              </h4>
              <p className="text-sm text-[var(--app-foreground-muted)]">
                {formattedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 rounded-full bg-[var(--app-gray)] text-xs font-medium text-[var(--app-foreground-muted)]">
              Post #{index + 1}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-3">
          <p className="text-[var(--app-foreground)] leading-relaxed whitespace-pre-wrap">
            {isExpanded || !isLong ? content : preview}
          </p>
          
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] text-sm font-medium transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      {/* Post Footer */}
      <div className="px-6 py-4 bg-[var(--app-gray)] border-t border-[var(--app-card-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors">
              <Icon name="star" size="sm" />
              <span className="text-sm">Exclusive Content</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 text-[var(--app-foreground-muted)]">
            <Icon name="check" size="sm" className="text-green-500" />
            <span className="text-sm">Verified {tierName} Content</span>
          </div>
        </div>
      </div>
    </div>
  );
}
