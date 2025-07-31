"use client";

import { useAccount } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { Button, Icon } from "./DemoComponents";

interface NavbarProps {
  onCreateTribe?: () => void;
}

export function Navbar({ onCreateTribe }: NavbarProps) {
  const { isConnected } = useAccount();

  return (
    <nav className="w-full bg-[var(--app-card-bg)]/80 backdrop-blur-lg border-b border-[var(--app-card-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--app-accent)] to-blue-500 flex items-center justify-center shadow-lg">
                <Icon name="users" size="sm" className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--app-foreground)] to-[var(--app-foreground-muted)] bg-clip-text text-transparent">
                Tribe
              </h1>
            </div>
          </div>

          {/* Center - Navigation items (future use) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Add navigation items here when needed */}
            </div>
          </div>

          {/* Right side - Wallet and Create button */}
          <div className="flex items-center space-x-4">
            {/* Create Tribe Button - only show when connected */}
            {isConnected && (
              <Button
                variant="primary"
                size="sm"
                onClick={onCreateTribe}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-[var(--app-accent)] to-blue-500 hover:from-[var(--app-accent-hover)] hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                icon={<Icon name="users" size="sm" />}
              >
                Create Tribe
              </Button>
            )}

            {/* Wallet Connection */}
            <div className="flex items-center">
              <Wallet className="z-10">
                <ConnectWallet className="bg-gradient-to-r from-[var(--app-accent)] to-blue-500 hover:from-[var(--app-accent-hover)] hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  {!isConnected ? (
                    <div className="flex items-center space-x-2">
                      <Icon name="wallet" size="sm" />
                      <span>Connect Wallet</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-5 h-5" />
                      <Name className="text-white font-medium" />
                    </div>
                  )}
                </ConnectWallet>
                <WalletDropdown className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl shadow-xl">
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar className="w-8 h-8" />
                    <Name className="text-[var(--app-foreground)] font-medium" />
                    <Address className="text-[var(--app-foreground-muted)] text-sm" />
                    <EthBalance className="text-[var(--app-foreground-muted)] text-sm" />
                  </Identity>
                  <WalletDropdownDisconnect className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" />
                </WalletDropdown>
              </Wallet>
            </div>

            {/* Mobile Create Tribe Button */}
            {isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateTribe}
                className="sm:hidden text-[var(--app-accent)] hover:bg-[var(--app-accent-light)]"
                icon={<Icon name="users" size="sm" />}
              >
                Create
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}