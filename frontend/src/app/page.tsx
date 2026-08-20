"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "../components/Header";
import { BountyCard } from "../components/BountyCard";
import { CreateBountyModal } from "../components/CreateBountyModal";
import { SubmitPatchModal } from "../components/SubmitPatchModal";
import { Bounty, INITIAL_BOUNTIES, getBountiesFromRPC } from "../lib/genlayer";
import { Search, Filter, Shield, Cpu, ExternalLink, Sparkles, RefreshCw } from "lucide-react";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [bounties, setBounties] = useState<Bounty[]>(INITIAL_BOUNTIES);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedBountyForSubmit, setSelectedBountyForSubmit] = useState<Bounty | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isLoadingRpc, setIsLoadingRpc] = useState<boolean>(false);

  // Load RPC state on mount
  useEffect(() => {
    async function loadRPC() {
      setIsLoadingRpc(true);
      const data = await getBountiesFromRPC();
      if (data && data.length > 0) {
        setBounties(data);
      }
      setIsLoadingRpc(false);
    }
    loadRPC();
  }, []);

  // Compute statistics
  const bountyStats = useMemo(() => {
    const total = bounties.length;
    const active = bounties.filter((b) => b.status === 0).length;
    const resolved = bounties.filter((b) => b.status === 1).length;
    const totalEscrow = bounties
      .reduce((sum, b) => sum + parseFloat(b.reward_amount || "0"), 0)
      .toFixed(1);
    return { total, active, resolved, totalEscrow };
  }, [bounties]);

  // Filtered bounties list
  const filteredBounties = useMemo(() => {
    return bounties.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vulnerability_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.target_repo_url.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "OPEN") return b.status === 0;
      if (filterStatus === "RESOLVED") return b.status === 1;
      if (filterStatus === "REJECTED") return b.status === 2;
      return true; // ALL
    });
  }, [bounties, filterStatus, searchQuery]);

  const handleBountyCreated = (newBounty: Bounty) => {
    setBounties((prev) => [newBounty, ...prev]);
  };

  const handlePatchEvaluated = (bountyId: number, updatedBounty: Bounty) => {
    setBounties((prev) =>
      prev.map((b) => (b.id === bountyId ? updatedBounty : b))
    );
  };

  const handleOpenSubmitModal = (bounty: Bounty) => {
    setSelectedBountyForSubmit(bounty);
    setIsSubmitModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation & Header */}
      <Header
        account={account}
        setAccount={setAccount}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        bountyStats={bountyStats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/20 p-8 mb-10 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Powered by GenLayer Validator Consensus AI VM
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Decentralized AI-Driven Security Audit Bounties
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              Post smart contract vulnerability bounties backed by GenLayer native escrow. When security hunters submit pull requests, GenLayer Validators execute on-chain LLM consensus prompts (`gl.exec_prompt`) to automatically audit patch diffs and release rewards instantly.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <a
                href="https://testnet-rpc.genlayer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center hover:text-cyan-400 transition-colors"
              >
                <Cpu className="w-4 h-4 mr-1 text-cyan-400" /> RPC: https://testnet-rpc.genlayer.com
              </a>
              <span>•</span>
              <span>Chain ID: 61999</span>
              <span>•</span>
              <a
                href="https://genlayer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center hover:text-indigo-400 transition-colors"
              >
                Docs <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vulnerability, title, or repo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            />
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center p-1 bg-card border border-border rounded-xl space-x-1 text-xs font-semibold w-full sm:w-auto justify-center">
            {["ALL", "OPEN", "RESOLVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filterStatus === status
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Bounties Grid */}
        {filteredBounties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBounties.map((bounty) => (
              <BountyCard
                key={bounty.id}
                bounty={bounty}
                onOpenSubmitModal={handleOpenSubmitModal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No bounties found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              There are currently no security bounties matching your search or filter criteria.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
            >
              Create New Bounty
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 BugShield AI — Decentralized Security Audit Bounties on GenLayer</div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-1.5" />
              GenLayer Testnet Active
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateBountyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBountyCreated={handleBountyCreated}
        account={account}
      />

      <SubmitPatchModal
        bounty={selectedBountyForSubmit}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onPatchEvaluated={handlePatchEvaluated}
        account={account}
      />
    </div>
  );
}
