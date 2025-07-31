"use client";

import { useState } from "react";
import { Button, Icon } from "./DemoComponents";

interface CreateTribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTribe: (tribeData: TribeData) => void;
  isSubmitting?: boolean;
}

interface TribeData {
  name: string;
  description: string;
  goldSupply: number;
  goldPrice: number;
  silverSupply: number;
  silverPrice: number;
  bronzeSupply: number;
  bronzePrice: number;
}

export function CreateTribeModal({ isOpen, onClose, onCreateTribe, isSubmitting = false }: CreateTribeModalProps) {
  const [formData, setFormData] = useState<TribeData>({
    name: "",
    description: "",
    goldSupply: 0,
    goldPrice: 0,
    silverSupply: 0,
    silverPrice: 0,
    bronzeSupply: 0,
    bronzePrice: 0,
  });

  const handleInputChange = (field: keyof TribeData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || isSubmitting) return;

    try {
      await onCreateTribe(formData);
      // Reset form on success (modal will be closed by parent component)
      setFormData({
        name: "",
        description: "",
        goldSupply: 0,
        goldPrice: 0,
        silverSupply: 0,
        silverPrice: 0,
        bronzeSupply: 0,
        bronzePrice: 0,
      });
    } catch (error) {
      console.error("Error creating tribe:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--app-card-border)]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--app-accent)] to-blue-500 flex items-center justify-center">
              <Icon name="users" size="sm" className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-[var(--app-foreground)]">Create Your Tribe</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors"
          >
            <Icon name="plus" size="sm" className="rotate-45" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tribe Name */}
          <div>
            <label className="block text-sm font-semibold text-[var(--app-foreground)] mb-2">
              Tribe Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your tribe name..."
              className="w-full px-4 py-3 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:border-transparent"
              required
            />
          </div>

          {/* Tribe Description */}
          <div>
            <label className="block text-sm font-semibold text-[var(--app-foreground)] mb-2">
              Description <span className="text-[var(--app-foreground-muted)] font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your tribe and what makes it special..."
              className="w-full px-4 py-3 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:border-transparent resize-none"
            />
          </div>

          {/* Tier Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--app-foreground)]">NFT Tiers</h3>
            
            {/* Gold Tier */}
            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                <h4 className="font-semibold text-[var(--app-foreground)]">Gold Tier</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--app-foreground-muted)] mb-1">Supply</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.goldSupply || ''}
                    onChange={(e) => handleInputChange('goldSupply', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--app-foreground-muted)] mb-1">Price (ETH)</label>
                  <input
                    type="number"
                    
                    min="0"
                    value={formData.goldPrice || ''}
                    onChange={(e) => handleInputChange('goldPrice', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    placeholder="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Silver Tier */}
            <div className="p-4 bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-400/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"></div>
                <h4 className="font-semibold text-[var(--app-foreground)]">Silver Tier</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--app-foreground-muted)] mb-1">Supply</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.silverSupply || ''}
                    onChange={(e) => handleInputChange('silverSupply', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-1 focus:ring-gray-500"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--app-foreground-muted)] mb-1">Price (ETH)</label>
                  <input
                    type="number"
                    
                    min="0"
                    value={formData.silverPrice || ''}
                    onChange={(e) => handleInputChange('silverPrice', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-1 focus:ring-gray-500"
                    placeholder="0.05"
                  />
                </div>
              </div>
            </div>

            {/* Bronze Tier */}
            <div className="p-4 bg-gradient-to-r from-amber-600/10 to-amber-700/10 border border-amber-600/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-amber-800"></div>
                <h4 className="font-semibold text-[var(--app-foreground)]">Bronze Tier</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--app-foreground-muted)] mb-1">Supply</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bronzeSupply || ''}
                    onChange={(e) => handleInputChange('bronzeSupply', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-1 focus:ring-amber-600"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--app-foreground-muted)] mb-1">Price (ETH)</label>
                  <input
                    type="number"
                    
                    min="0"
                    value={formData.bronzePrice || ''}
                    onChange={(e) => handleInputChange('bronzePrice', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-1 focus:ring-amber-600"
                    placeholder="0.025"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--app-card-border)]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.name.trim()}
              icon={isSubmitting ? undefined : <Icon name="users" size="sm" />}
              className="bg-gradient-to-r from-[var(--app-accent)] to-blue-500 hover:from-[var(--app-accent-hover)] hover:to-blue-600"
            >
              {isSubmitting ? "Creating Tribe..." : "Create Tribe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}