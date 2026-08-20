"use client";

import React from "react";
import { ShieldCheck, Cpu, Wallet, ExternalLink, Sparkles } from "lucide-react";
import { connectWallet } from "../lib/genlayer";

interface HeaderProps {
  account: string | null;
  setAccount: (account: string | null) => void;
  onOpenCreateModal: () => void;
  bountyStats: { total: number; active: number; resolved: number; totalEscrow: string };
}

export const Header: React.FC<HeaderProps> = ({
  account,
  setAccount,
  onOpenCreateModal,
  bountyStats,
}) => {
  const handleConnect = async () => {
    const acc = await connectWallet();
    if (acc) setAccount(acc);
  };

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  BugShield AI
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Cpu className="w-3 h-3 mr-1 animate-pulse text-cyan-400" />
                  GenLayer Testnet
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Decentralized AI-Driven Security Audit Bounties
              </p>
            </div>
          </div>

          {/* Action Buttons & Wallet Connection */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Bug Bounty
            </button>

            <button
              onClick={handleConnect}
              className="inline-flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm border border-border bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 hover:text-white transition-all shadow-inner"
            >
              <Wallet className="w-4 h-4 mr-2 text-indigo-400" />
              {account ? (
                <span>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </div>
        </div>

        {/* Global Bounty Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-border/50 text-xs sm:text-sm">
          <div className="bg-slate-900/40 border border-border/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-400">Total Bounties</span>
            <span className="font-bold text-white text-base">{bountyStats.total}</span>
          </div>
          <div className="bg-slate-900/40 border border-border/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-400">Active Bounties</span>
            <span className="font-bold text-cyan-400 text-base">{bountyStats.active}</span>
          </div>
          <div className="bg-slate-900/40 border border-border/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-400">Resolved & Paid</span>
            <span className="font-bold text-emerald-400 text-base">{bountyStats.resolved}</span>
          </div>
          <div className="bg-slate-900/40 border border-border/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-400">Total Escrow Pool</span>
            <span className="font-bold text-indigo-300 text-base">{bountyStats.totalEscrow} GEN</span>
          </div>
        </div>
      </div>
    </header>
  );
};
