"use client";

import { useAccount } from "wagmi";
import {
  ConnectWallet,
  Wallet,
} from "@coinbase/onchainkit/wallet";
import { Icon } from "./DemoComponents";

export function WelcomeHero() {
  const { isConnected } = useAccount();

  // Don't show if user is already connected
  if (isConnected) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* Hero Content */}
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl pt-10 md:text-6xl font-bold bg-gradient-to-r from-[var(--app-accent)] via-blue-500 to-purple-500 bg-clip-text text-transparent leading-tight">
            Your Tribe is your vibe!
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--app-foreground-muted)] font-medium">
            We connect you to your favourite content creators
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="flex items-start space-x-4 p-6 rounded-xl bg-[var(--app-card-bg)] border border-[var(--app-card-border)]">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--app-accent)] to-blue-500 flex items-center justify-center flex-shrink-0">
              <Icon name="users" size="sm" className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[var(--app-foreground)] mb-2">Join Exclusive Communities</h3>
              <p className="text-sm text-[var(--app-foreground-muted)]">Access unique NFT collections from your favorite creators and join their exclusive tribe.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-6 rounded-xl bg-[var(--app-card-bg)] border border-[var(--app-card-border)]">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Icon name="star" size="sm" className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[var(--app-foreground)] mb-2">Collect & Trade NFTs</h3>
              <p className="text-sm text-[var(--app-foreground-muted)]">Buy, sell, and trade exclusive NFTs directly from content creators you love.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-6 rounded-xl bg-[var(--app-card-bg)] border border-[var(--app-card-border)]">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Icon name="heart" size="sm" className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[var(--app-foreground)] mb-2">Support Your Creators</h3>
              <p className="text-sm text-[var(--app-foreground-muted)]">Directly support creators through NFT purchases and become part of their journey.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-6 rounded-xl bg-[var(--app-card-bg)] border border-[var(--app-card-border)]">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
              <Icon name="plus" size="sm" className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[var(--app-foreground)] mb-2">Create Your Own Tribe</h3>
              <p className="text-sm text-[var(--app-foreground-muted)]">Launch your own NFT collection and build a community around your content.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 space-y-8">
          <div className="space-y-4">
            <p className="text-2xl text-[var(--app-foreground)] font-bold">
              Ready to find your tribe? 🚀
            </p>
            <p className="text-lg text-[var(--app-foreground-muted)] max-w-xl mx-auto">
              Join thousands of creators and collectors in the most vibrant NFT community
            </p>
          </div>
          
          <div className="flex justify-center">
            <Wallet className="z-10">
              <ConnectWallet className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-bold px-12 py-5 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 border border-white/10">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                
                <div className="relative flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                    <Icon name="wallet" size="sm" className="text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xl font-bold">Connect Wallet</span>
                    <span className="text-sm text-blue-100 opacity-90">Start your journey</span>
                  </div>
                  <Icon name="arrow-right" size="sm" className="text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </ConnectWallet>
            </Wallet>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-[var(--app-foreground-muted)]">
              🔐 Secure • 🌟 Instant Access • 🎨 Exclusive Content
            </p>
            <p className="text-xs text-[var(--app-foreground-muted)] opacity-75">
              Connect your wallet to start exploring exclusive NFT collections and join creator communities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}