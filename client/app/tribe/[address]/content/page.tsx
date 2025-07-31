"use client";

import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { Address } from "viem";
import { useState } from "react";
import { TribeNFTAbi, TierType } from "../../../../lib/Tribe";
import { Button, Icon } from "../../../components/DemoComponents";

interface TierContent {
  name: string;
  type: TierType;
  color: string;
  gradient: string;
  borderColor: string;
  content: {
    title: string;
    description: string;
    sections: {
      title: string;
      content: string;
    }[];
  };
}

const tierContents: TierContent[] = [
  {
    name: "Bronze",
    type: TierType.Bronze,
    color: "from-amber-600 to-amber-800",
    gradient: "from-amber-600/10 to-amber-700/10",
    borderColor: "border-amber-600/20",
    content: {
      title: "Bronze Member Exclusive Content",
      description: "Welcome to the Bronze tier! Access foundational knowledge and community updates.",
      sections: [
        {
          title: "Community Updates",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        },
        {
          title: "Getting Started Guide",
          content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
        },
        {
          title: "Basic Resources",
          content: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt."
        }
      ]
    }
  },
  {
    name: "Silver",
    type: TierType.Silver,
    color: "from-gray-400 to-gray-600",
    gradient: "from-gray-400/10 to-gray-500/10",
    borderColor: "border-gray-400/20",
    content: {
      title: "Silver Member Premium Content",
      description: "Silver tier members enjoy advanced insights, exclusive tutorials, and priority support.",
      sections: [
        {
          title: "Advanced Strategies",
          content: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga."
        },
        {
          title: "Exclusive Tutorials",
          content: "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet."
        },
        {
          title: "Market Analysis",
          content: "Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh."
        },
        {
          title: "Priority Support Access",
          content: "Ut fermentum massa justo sit amet risus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."
        }
      ]
    }
  },
  {
    name: "Gold",
    type: TierType.Gold,
    color: "from-yellow-400 to-yellow-600",
    gradient: "from-yellow-500/10 to-yellow-600/10",
    borderColor: "border-yellow-500/20",
    content: {
      title: "Gold Member Elite Content",
      description: "The ultimate tier with exclusive access to insider information, private events, and direct leadership contact.",
      sections: [
        {
          title: "Insider Information",
          content: "Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Donec ullamcorper nulla non metus auctor fringilla. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit."
        },
        {
          title: "Private Event Access",
          content: "Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper."
        },
        {
          title: "Executive Insights",
          content: "Maecenas sed diam eget risus varius blandit sit amet non magna. Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est at lobortis. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus."
        },
        {
          title: "Direct Leadership Contact",
          content: "Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Etiam porta sem malesuada magna mollis euismod. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Nullam quis risus eget urna mollis ornare vel eu leo. Donec id elit non mi porta gravida at eget metus."
        },
        {
          title: "Exclusive Investment Opportunities",
          content: "Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros."
        }
      ]
    }
  }
];

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address: userAddress } = useAccount();

  const tribeAddress = params.address as Address;

  // Fetch tribe basic info
  const { data: tribeName } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "name",
  });

  // Fetch user's tier membership
  const { data: userMemberTiers } = useReadContract({
    address: tribeAddress,
    abi: TribeNFTAbi,
    functionName: "getMemberTiers",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!isConnected,
    },
  }) as { data: readonly [bigint, bigint, bigint] | undefined };

  const handleGoBack = () => {
    router.back();
  };

  // Check if user has access to a specific tier
  const hasAccess = (tierType: TierType): boolean => {
    if (!userMemberTiers) return false;
    return Number(userMemberTiers[tierType]) > 0;
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

        {/* Tier Content */}
        {isConnected && (
          <div className="space-y-8">
            {tierContents.map((tierContent) => (
              <TierContentCard
                key={tierContent.type}
                tierContent={tierContent}
                hasAccess={hasAccess(tierContent.type)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TierContentCardProps {
  tierContent: TierContent;
  hasAccess: boolean;
}

function TierContentCard({ tierContent, hasAccess }: TierContentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gradient-to-r ${tierContent.gradient} border ${tierContent.borderColor} rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className="p-6 border-b border-current border-opacity-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${tierContent.color}`}></div>
            <div>
              <h2 className="text-xl font-bold text-[var(--app-foreground)]">
                {tierContent.content.title}
              </h2>
              <p className="text-[var(--app-foreground-muted)] text-sm">
                {tierContent.content.description}
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
            <div className="space-y-6">
              {tierContent.content.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-semibold text-[var(--app-foreground)]">
                    {section.title}
                  </h3>
                  <p className="text-[var(--app-foreground-muted)] leading-relaxed">
                    {section.content}
                  </p>
                  {index < tierContent.content.sections.length - 1 && (
                    <div className="border-b border-current border-opacity-10 pb-3"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="plus" size="lg" className="text-[var(--app-foreground-muted)] mx-auto mb-4 transform rotate-45" />
              <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
                {tierContent.name} Tier Required
              </h3>
              <p className="text-[var(--app-foreground-muted)] mb-4">
                You need to own at least one {tierContent.name} NFT to access this content.
              </p>
              <Button
                onClick={() => window.history.back()}
                variant="primary"
                size="md"
              >
                Mint {tierContent.name} NFT
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
