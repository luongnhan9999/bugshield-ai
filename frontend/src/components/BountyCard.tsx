"use client";

import React, { useState } from "react";
import { Bounty, cancelBountyOnChain } from "../lib/genlayer";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Github,
  ChevronDown,
  ChevronUp,
  Brain,
  Code2,
  Award,
  Send,
  Lock,
  Crown,
  UserCheck,
  RotateCcw,
} from "lucide-react";

interface BountyCardProps {
  bounty: Bounty;
  onOpenSubmitModal: (bounty: Bounty) => void;
  onBountyCancelled?: (bountyId: number) => void;
  currentAccount?: string | null;
}

export const BountyCard: React.FC<BountyCardProps> = ({
  bounty,
  onOpenSubmitModal,
  onBountyCancelled,
  currentAccount,
}) => {
  const [showAiReasoning, setShowAiReasoning] = useState<boolean>(
    bounty.status === 1 || Boolean(bounty.ai_verdict_reason)
  );
  const [isCancelling, setIsCancelling] = useState(false);

  const isCreator =
    Boolean(currentAccount) &&
    currentAccount?.toLowerCase() === bounty.creator.toLowerCase();

  const handleCancelBounty = async () => {
    if (!confirm("Are you sure you want to cancel this bounty and claim your escrow refund on-chain?")) {
      return;
    }
    setIsCancelling(true);
    try {
      if (currentAccount && typeof window !== "undefined" && window.ethereum) {
        const res = await cancelBountyOnChain(bounty.id, currentAccount);
        alert(`On-Chain Cancellation Tx Sent! Tx Hash: ${res.txHash}`);
      } else {
        await new Promise((res) => setTimeout(res, 1000));
      }
      if (onBountyCancelled) {
        onBountyCancelled(bounty.id);
      }
    } catch (err: any) {
      console.error("Error cancelling bounty:", err);
      alert(`Cancellation failed: ${err.message || err}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = () => {
    switch (bounty.status) {
      case 1:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            RESOLVED & PAID
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <XCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
            CANCELLED & REFUNDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-cyan-400 animate-pulse" />
            OPEN FOR PATCH
          </span>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group relative">
      <div>
        {/* Header line: Title & Status */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
            {bounty.title}
          </h3>
          {getStatusBadge()}
        </div>

        {/* Creator Role Badge */}
        {isCreator && (
          <div className="mb-3 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Crown className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Created by You (Escrow Lock Account)
          </div>
        )}

        {/* Target Repo Link */}
        <div className="mb-4">
          <a
            href={bounty.target_repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <Github className="w-3.5 h-3.5 mr-1.5" />
            <span className="truncate max-w-xs">{bounty.target_repo_url}</span>
          </a>
        </div>

        {/* Vulnerability Description */}
        <div className="mb-4 bg-slate-900/60 rounded-xl p-3.5 border border-border/50 text-xs sm:text-sm">
          <div className="flex items-center text-slate-400 font-semibold mb-1.5">
            <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-400" />
            Vulnerability Details
          </div>
          <p className="text-slate-300 leading-relaxed">{bounty.vulnerability_description}</p>
        </div>

        {/* Expected Fix Criteria */}
        <div className="mb-4 bg-slate-900/40 rounded-xl p-3.5 border border-border/40 text-xs sm:text-sm">
          <div className="flex items-center text-slate-400 font-semibold mb-1.5">
            <Code2 className="w-4 h-4 mr-1.5 text-indigo-400" />
            Acceptance Fix Criteria
          </div>
          <p className="text-slate-300 leading-relaxed">{bounty.expected_fix_criteria}</p>
        </div>

        {/* Escrow Reward Amount */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20 mb-4">
          <div className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-indigo-400" />
            <span className="text-xs text-slate-400 font-medium">Escrow Reward</span>
          </div>
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300">
            {bounty.reward_amount} GEN
          </span>
        </div>

        {/* AI Reasoning Inspector Box */}
        {bounty.ai_verdict_reason && (
          <div className="mb-4 border border-indigo-500/30 rounded-xl overflow-hidden bg-slate-950/80">
            <button
              onClick={() => setShowAiReasoning(!showAiReasoning)}
              className="w-full px-4 py-2.5 bg-slate-900/90 hover:bg-slate-900 flex items-center justify-between text-xs font-bold text-indigo-300 transition-colors"
            >
              <div className="flex items-center">
                <Brain className="w-4 h-4 mr-2 text-cyan-400 animate-pulse" />
                <span>AI Reasoning Inspector (GenLayer Validator Verdict)</span>
              </div>
              {showAiReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAiReasoning && (
              <div className="p-4 text-xs text-slate-300 border-t border-border/40 space-y-2">
                <p className="leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800 font-mono text-cyan-200">
                  {bounty.ai_verdict_reason}
                </p>
                {bounty.winner && bounty.winner !== "0x0000000000000000000000000000000000000000" && (
                  <div className="flex items-center text-emerald-400 font-semibold pt-1 text-[11px]">
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    Winner Hunter Address: {bounty.winner}
                  </div>
                )}
                {bounty.patch_pr_url && (
                  <div className="pt-1">
                    <a
                      href={bounty.patch_pr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:underline flex items-center"
                    >
                      <Github className="w-3 h-3 mr-1" /> View Approved Pull Request
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer: Allow both Submit Security Patch & Cancel Refund for maximum testability */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
          Creator: {bounty.creator.slice(0, 6)}...{bounty.creator.slice(-4)}
        </div>

        {bounty.status === 0 ? (
          <div className="flex items-center space-x-2">
            {isCreator && (
              <button
                onClick={handleCancelBounty}
                disabled={isCancelling}
                title="Cancel Bounty & Claim Escrow Refund On-Chain"
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 text-rose-400" />
                {isCancelling ? "Cancelling..." : "Cancel & Refund"}
              </button>
            )}
            <button
              onClick={() => onOpenSubmitModal(bounty)}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 transform hover:-translate-y-0.5"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Submit Security Patch
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center text-xs text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Bounty Closed
          </span>
        )}
      </div>
    </div>
  );
};
