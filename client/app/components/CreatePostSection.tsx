"use client";

import { useState } from "react";
import { Button, Icon } from "./DemoComponents";
import { TierType } from "../../lib/Tribe";

interface TierInfo {
  name: string;
  type: TierType;
  color: string;
  gradient: string;
  borderColor: string;
}

interface CreatePostSectionProps {
  tiers: TierInfo[];
  onCreatePost: (postData: PostData) => void;
  isSubmitting?: boolean;
}

interface PostData {
  content: string;
  allowedTiers: TierType[];
}

export function CreatePostSection({ tiers, onCreatePost, isSubmitting = false }: CreatePostSectionProps) {
  const [postContent, setPostContent] = useState("");
  const [selectedTiers, setSelectedTiers] = useState<TierType[]>([]);

  const handleTierToggle = (tierType: TierType) => {
    setSelectedTiers(prev => 
      prev.includes(tierType) 
        ? prev.filter(t => t !== tierType)
        : [...prev, tierType]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || selectedTiers.length === 0 || isSubmitting) return;

    try {
      await onCreatePost({
        content: postContent.trim(),
        allowedTiers: selectedTiers,
      });
      
      // Reset form
      setPostContent("");
      setSelectedTiers([]);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const isFormValid = postContent.trim() && selectedTiers.length > 0;

  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-[var(--app-foreground)] mb-6">Create Post for Members</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Content */}
        <div>
          <label className="block text-sm font-semibold text-[var(--app-foreground)] mb-2">
            Post Content
          </label>
          <textarea
            rows={4}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share an update, announcement, or exclusive content with your tribe members..."
            className="w-full px-4 py-3 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Tier Selection */}
        <div>
          <label className="block text-sm font-semibold text-[var(--app-foreground)] mb-3">
            Who can view this post?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tiers.map((tier) => {
              const isSelected = selectedTiers.includes(tier.type);
              
              return (
                <button
                  key={tier.type}
                  type="button"
                  onClick={() => handleTierToggle(tier.type)}
                  disabled={isSubmitting}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? `bg-gradient-to-r ${tier.gradient} ${tier.borderColor} border-opacity-60`
                      : "bg-[var(--app-background)] border-[var(--app-card-border)] hover:border-[var(--app-accent)]/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${tier.color}`}></div>
                    <div className="text-left">
                      <div className="font-semibold text-[var(--app-foreground)]">{tier.name} Tier</div>
                      <div className="text-xs text-[var(--app-foreground-muted)]">
                        {isSelected ? "Selected" : "Click to select"}
                      </div>
                    </div>
                    {isSelected && (
                      <Icon name="check" size="sm" className="text-[var(--app-accent)] ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {selectedTiers.length === 0 && (
            <p className="text-sm text-[var(--app-foreground-muted)] mt-2">
              Select at least one tier to share your post with
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!isFormValid || isSubmitting}
            icon={isSubmitting ? undefined : <Icon name="users" size="sm" />}
            className="bg-gradient-to-r from-[var(--app-accent)] to-blue-500 hover:from-[var(--app-accent-hover)] hover:to-blue-600"
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}