"use client";

import React, { useEffect } from "react";
import { ShieldCheck, Cpu, Wallet, LogOut, Sparkles, CheckCircle } from "lucide-react";
import { connectWallet, getConnectedAccount } from "../lib/genlayer";

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
  // Auto-detect existing wallet session & listen for account changes
  useEffect(() => {
    async function checkSession() {
      const activeAccount = await getConnectedAccount();
      if (activeAccount) setAccount(activeAccount);
    }
    checkSession();

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null); // User disconnected from extension
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [setAccount]);

  const handleConnect = async () => {
    const acc = await connectWallet();
    if (acc) setAccount(acc);
  };

  const handleDisconnect = () => {
    setAccount(null);
  };

  return (
    <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40">
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

          {/* Action Buttons & Wallet Connect / Disconnect */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Bug Bounty
            </button>

            {account ? (
              <div className="flex items-center space-x-2">
                <div className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold border border-indigo-500/30 bg-indigo-950/40 text-indigo-300">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  title="Disconnect Wallet"
                  className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 hover:text-white transition-all shadow-inner"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="inline-flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm border border-cyan-500/40 bg-slate-900/90 hover:bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 transition-all shadow-inner"
              >
                <Wallet className="w-4 h-4 mr-2 text-cyan-400" />
                Connect Web3 Wallet
              </button>
            )}
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
