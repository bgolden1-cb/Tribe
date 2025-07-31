"use client";

import { useOpenUrl } from "@coinbase/onchainkit/minikit";

export function Footer() {
  const openUrl = useOpenUrl();

  return (
    <footer className="w-full mt-10 pt-5 pb-5">
      <div className="max-w-4xl mx-auto px-4">
        {/* Narrower horizontal line */}
        <div className="w-120 h-px bg-gray-600 mx-auto mb-6"></div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-6 text-sm">
            <button
              onClick={() => openUrl("https://base.org")}
              className="text-[var(--app-foreground-muted)] hover:text-[var(--app-accent)] transition-colors duration-200"
            >
              Built on Base
            </button>
            <span className="text-[var(--app-card-border)]">•</span>
            <button
              onClick={() => openUrl("https://base.org/builders/minikit")}
              className="text-[var(--app-foreground-muted)] hover:text-[var(--app-accent)] transition-colors duration-200"
            >
              Powered by MiniKit
            </button>
          </div>
          <p className="text-xs text-[var(--app-foreground-muted)] opacity-60">
            © 2025 Tribe. Connecting creators and communities.
          </p>
        </div>
      </div>
    </footer>
  );
}