"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertCircle, Zap } from "lucide-react";
import { Bounty, createBountyOnChain } from "../lib/genlayer";

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
  const [rewardAmount, setRewardAmount] = useState("3.5");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txNotice, setTxNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Quick Demo Auto-Fill for Judges / Evaluators
  const handleQuickFillDemo = () => {
    setTitle("Flash Loan Oracle Price Manipulation in Lending Pool");
    setTargetRepoUrl("https://github.com/bugshield-ai/lending-protocol-v2");
    setVulnerabilityDescription(
      "The calculateCollateralValue() function relies on single-block spot price from UniswapV2 pair, enabling flash loan attackers to artificially manipulate price ratios and execute bad debt liquidations."
    );
    setExpectedFixCriteria(
      "Replace spot price query with Chainlink TWAP Oracle or Pyth Network multi-block price feed validator."
    );
    setRewardAmount("3.5");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetRepoUrl || !vulnerabilityDescription || !expectedFixCriteria) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTxNotice(null);

    try {
      if (account && typeof window !== "undefined" && window.ethereum) {
        setTxNotice("Prompting MetaMask for real on-chain transaction approval...");
        const result = await createBountyOnChain(
          title,
          targetRepoUrl,
          vulnerabilityDescription,
          expectedFixCriteria,
          rewardAmount,
          account
        );
        setTxNotice(`On-chain transaction sent! Hash: ${result.txHash.slice(0, 12)}...`);
        await new Promise((res) => setTimeout(res, 1000));
        onBountyCreated(result.bounty);
      } else {
        // Fallback preview mode when wallet disconnected
        const createdBounty: Bounty = {
          id: Date.now(),
          creator: account || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          title,
          target_repo_url: targetRepoUrl,
          vulnerability_description: vulnerabilityDescription,
          expected_fix_criteria: expectedFixCriteria,
          reward_amount: rewardAmount || "1.0",
          status: 0,
          winner: "",
          ai_verdict_reason: "",
          patch_pr_url: "",
        };
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onBountyCreated(createdBounty);
      }

      onClose();
      // Reset form
      setTitle("");
      setTargetRepoUrl("");
      setVulnerabilityDescription("");
      setExpectedFixCriteria("");
      setRewardAmount("3.5");
    } catch (err: any) {
      console.error("Error creating bounty:", err);
      alert(`Transaction failed or rejected: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
      setTxNotice(null);
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
        <div className="flex items-center justify-between mb-4 pr-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Security Bug Bounty</h2>
              <p className="text-xs text-slate-400">
                Escrow funds as <span className="text-indigo-300 font-semibold">👑 Bounty Creator</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Demo Pre-fill Button for Judges */}
        <div className="mb-4 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
          <div className="text-xs text-indigo-200">
            <span className="font-bold text-indigo-300">👑 Judge Fast-Test Mode:</span> Auto-fill sample vulnerability details
          </div>
          <button
            type="button"
            onClick={handleQuickFillDemo}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center transition-all"
          >
            <Zap className="w-3.5 h-3.5 mr-1 text-slate-950 fill-current" />
            Auto-Fill Demo
          </button>
        </div>

        {!account ? (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            Wallet not connected. Connect Web3 wallet at top right for real on-chain transaction execution!
          </div>
        ) : (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-400" />
            Connected ({account.slice(0, 6)}...). Real on-chain transaction will be sent to GenLayer Testnet.
          </div>
        )}

        {txNotice && (
          <div className="mb-4 p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 font-mono flex items-center">
            <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
            {txNotice}
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
                  Locking Escrow On-Chain...
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
