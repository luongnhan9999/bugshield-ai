"use client";

import React from "react";
import {
  ShieldCheck,
  Cpu,
  Github,
  Twitter,
  MessageSquare,
  Globe,
  ExternalLink,
  BookOpen,
  Droplet,
  Search,
  Code,
  CheckCircle2,
} from "lucide-react";
import { CONTRACT_ADDRESS } from "../lib/genlayer";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-slate-950 text-slate-400 text-xs sm:text-sm pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-border/50">
          {/* Column 1: Project Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 rounded-xl shadow-md">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                BugShield AI
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Decentralized AI-Driven Security Audit Bounties running on <strong>GenLayer Testnet</strong>. Smart contract escrows are protected by multi-validator on-chain LLM consensus prompts (`gl.exec_prompt`).
            </p>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>GenLayer VM Active (Chain ID: 61999)</span>
            </div>
          </div>

          {/* Column 2: Ecosystem & Developer Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              GenLayer Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://genlayer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors flex items-center"
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  GenLayer Official Website
                </a>
              </li>
              <li>
                <a
                  href="https://docs.genlayer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors flex items-center"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  GenLayer Developer Docs
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.genlayer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center text-cyan-300"
                >
                  <Droplet className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  GenLayer Testnet Faucet
                </a>
              </li>
              <li>
                <a
                  href="https://scan.genlayer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors flex items-center"
                >
                  <Search className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  GenLayer Block Explorer
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Community & Social Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              GenLayer Community & Socials
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/luongnhan9999/bugshield-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Github className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
                  BugShield GitHub Repo
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/genlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400 transition-colors flex items-center"
                >
                  <Twitter className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                  Twitter / X (@genlayer)
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/genlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors flex items-center"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  Discord Community
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/genlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center"
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  Telegram Announcement Channel
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contract On-Chain Specs */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              On-Chain Intelligent Contract
            </h4>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-border/60 text-xs space-y-2">
              <div className="flex items-center text-indigo-300 font-semibold">
                <Code className="w-4 h-4 mr-1.5 text-indigo-400" />
                BugShield Intelligent Contract
              </div>
              <div className="font-mono text-[11px] text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                {CONTRACT_ADDRESS}
              </div>
              <div className="flex items-center text-emerald-400 text-[11px] font-medium pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Verified Python Code on GenLayer VM
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 BugShield AI. All rights reserved. Built for GenLayer Testnet Hackathon.
          </div>
          <div className="flex items-center space-x-6">
            <span>Privacy Policy</span>
            <span>Terms of Audit Service</span>
            <a
              href="https://testnet-rpc.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center"
            >
              RPC Endpoint <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
