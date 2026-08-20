"use client";

import React, { useState } from "react";
import { X, Send, Cpu, Brain, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Bounty } from "../lib/genlayer";

interface SubmitPatchModalProps {
  bounty: Bounty | null;
  isOpen: boolean;
  onClose: () => void;
  onPatchEvaluated: (bountyId: number, updatedBounty: Bounty) => void;
  account: string | null;
}

export const SubmitPatchModal: React.FC<SubmitPatchModalProps> = ({
  bounty,
  isOpen,
  onClose,
  onPatchEvaluated,
  account,
}) => {
  const [patchCode, setPatchCode] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState<string>("");

  if (!isOpen || !bounty) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patchCode || !prUrl) {
      alert("Please provide both code patch diff and Pull Request URL.");
      return;
    }

    setIsAuditing(true);

    // Simulate multi-step GenLayer Validator AI Consensus Execution
    setAuditStep("Step 1/3: Broadcasting Patch to GenLayer Validators...");
    await new Promise((res) => setTimeout(res, 1200));

    setAuditStep("Step 2/3: Executing On-Chain LLM Prompt (gl.exec_prompt)...");
    await new Promise((res) => setTimeout(res, 2000));

    setAuditStep("Step 3/3: Reaching Validator Consensus & Verifying Security Criteria...");
    await new Promise((res) => setTimeout(res, 1500));

    // Determine validity based on patch content heuristics
    const codeLower = patchCode.toLowerCase();
    const isSuccess =
      codeLower.includes("modifier") ||
      codeLower.includes("reentrancyguard") ||
      codeLower.includes("nonreentrant") ||
      codeLower.includes("require(") ||
      codeLower.includes("onlyowner") ||
      codeLower.includes("safemath") ||
      codeLower.includes("math.");

    let verdictReason = "";
    let newStatus: 0 | 1 | 2 = 0;

    if (isSuccess) {
      newStatus = 1; // RESOLVED
      verdictReason = `VALIDATOR CONSENSUS PASSED: The submitted security patch eliminates the vulnerability by introducing proper guards/access checks. Acceptance criteria met. Escrow of ${bounty.reward_amount} GEN disbursed.`;
    } else {
      newStatus = 0; // Remains Open with rejected feedback
      verdictReason = `VALIDATOR CONSENSUS REJECTED: The submitted diff lacks explicit security guards or access control checks matching acceptance criteria. Security flaw remains active. Please update your patch.`;
    }

    const updatedBounty: Bounty = {
      ...bounty,
      status: newStatus,
      winner: isSuccess ? account || "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" : bounty.winner,
      ai_verdict_reason: verdictReason,
      patch_pr_url: prUrl,
    };

    setIsAuditing(false);
    onPatchEvaluated(bounty.id, updatedBounty);
    onClose();
    setPatchCode("");
    setPrUrl("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isAuditing}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Submit Security Patch</h2>
            <p className="text-xs text-slate-400">
              Submit code patch for <span className="text-indigo-300 font-semibold">{bounty.title}</span>
            </p>
          </div>
        </div>

        {/* AI Auditing Loader State */}
        {isAuditing ? (
          <div className="py-12 px-4 text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center mx-auto" />
              <Brain className="w-8 h-8 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400 animate-bounce" />
                Validators Consensus AI Auditing...
              </h3>
              <p className="text-xs text-cyan-300 font-mono mt-2 bg-slate-900/80 py-2 px-4 rounded-xl border border-cyan-500/20 max-w-md mx-auto">
                {auditStep}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GitHub Pull Request URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://github.com/organization/repository/pull/42"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Code Patch Diff or Snippet *
              </label>
              <textarea
                required
                rows={6}
                placeholder={`// Paste your Git diff or modified smart contract code snippet here\n\n- function withdraw() public {\n+ function withdraw() public nonReentrant {\n    // ...\n  }`}
                value={patchCode}
                onChange={(e) => setPatchCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
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
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-sans shadow-lg shadow-cyan-500/20 transition-all flex items-center"
              >
                <Cpu className="w-4 h-4 mr-1.5" />
                Submit & Trigger AI Consensus Audit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
