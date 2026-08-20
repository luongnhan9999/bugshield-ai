"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { Bounty } from "../lib/genlayer";

interface CreateBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBountyCreated: (newBounty: Bounty) => void;
  account: string | null;
}

export const CreateBountyModal: React.FC<CreateBountyModalProps> = ({
  isOpen,
  onClose,
  onBountyCreated,
  account,
}) => {
  const [title, setTitle] = useState("");
  const [targetRepoUrl, setTargetRepoUrl] = useState("");
  const [vulnerabilityDescription, setVulnerabilityDescription] = useState("");
  const [expectedFixCriteria, setExpectedFixCriteria] = useState("");
  const [rewardAmount, setRewardAmount] = useState("1.0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetRepoUrl || !vulnerabilityDescription || !expectedFixCriteria) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new bounty object
      const createdBounty: Bounty = {
        id: Date.now(),
        creator: account || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        title,
        target_repo_url: targetRepoUrl,
        vulnerability_description: vulnerabilityDescription,
        expected_fix_criteria: expectedFixCriteria,
        reward_amount: rewardAmount || "1.0",
        status: 0, // OPEN
        winner: "",
        ai_verdict_reason: "",
        patch_pr_url: "",
      };

      // Simulate on-chain call latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      onBountyCreated(createdBounty);
      onClose();
      // Reset form
      setTitle("");
      setTargetRepoUrl("");
      setVulnerabilityDescription("");
      setExpectedFixCriteria("");
      setRewardAmount("1.0");
    } catch (err) {
      console.error("Error creating bounty:", err);
      alert("Failed to create bounty.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Security Bug Bounty</h2>
            <p className="text-xs text-slate-400">
              Escrow funds on GenLayer Testnet & trigger AI consensus auditing.
            </p>
          </div>
        </div>

        {!account && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            Wallet not connected. Submitting will use active demo test address.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bounty Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flash Loan Arbitrage Vulnerability in Swap.sol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Repository URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://github.com/organization/repository"
              value={targetRepoUrl}
              onChange={(e) => setTargetRepoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vulnerability Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detailed explanation of the security issue, vector of attack, or missing access control..."
              value={vulnerabilityDescription}
              onChange={(e) => setVulnerabilityDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Expected Fix Criteria *
            </label>
            <textarea
              required
              rows={2}
              placeholder="What requirements must the security patch satisfy for automatic AI approval?"
              value={expectedFixCriteria}
              onChange={(e) => setExpectedFixCriteria(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Escrow Reward Amount (GEN) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border text-slate-300 hover:text-white bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Locking Escrow on GenLayer...
                </>
              ) : (
                "Lock Escrow & Create Bounty"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
