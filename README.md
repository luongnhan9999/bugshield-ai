# 🛡️ BugShield AI — Decentralized Security Audit Bounties on GenLayer Testnet

**BugShield AI** is an intelligent security bounty platform built on the **GenLayer Testnet**. It enables Web3 projects to post smart contract vulnerability bounties backed by native token escrows. When security hunters submit code patches and GitHub Pull Requests, GenLayer Validators execute on-chain LLM consensus prompts (`gl.exec_prompt`) to independently audit the patch code and automatically disburse rewards upon validation.

---

## 🚀 Key Features

- **On-Chain Native Escrow:** Bounty creators lock rewards in GenLayer Intelligent Contracts.
- **Validator AI Consensus Audit:** GenLayer's decentralized VM executes multi-validator LLM prompts to audit submitted patch diffs against vulnerability acceptance criteria.
- **Automatic Reward Payouts:** If the AI consensus validates the patch, escrow tokens are automatically transferred to the hunter's Web3 address.
- **AI Reasoning Inspector:** Clear technical breakdown log explaining validator verdict decisions for approved or rejected patches.
- **Web3 Wallet Integration:** Seamless connection to MetaMask or GenLayer compatible Web3 wallets (Chain ID: `61999`, RPC: `https://testnet-rpc.genlayer.com`).

---

## 📁 Repository Structure

```
bugshield-ai/
├── contracts/
│   └── bug_shield.py              # GenLayer Python Intelligent Contract
├── scripts/
│   ├── deploy.py                  # Deploy script to GenLayer Testnet
│   └── interact.py                # Test script for bounty & PR submission
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Dashboard & Bounty listing page
│   │   │   ├── layout.tsx         # Root layout & meta settings
│   │   │   └── globals.css        # Tailwind styling & dark theme
│   │   ├── components/
│   │   │   ├── Header.tsx         # Navigation header & statistics bar
│   │   │   ├── BountyCard.tsx     # Card component & AI Reasoning Inspector
│   │   │   ├── CreateBountyModal.tsx  # Create bounty modal form
│   │   │   └── SubmitPatchModal.tsx  # Submit patch modal with AI auditor loading state
│   │   └── lib/
│   │       └── genlayer.ts        # RPC connector & Web3 wallet helper
│   ├── package.json               # Dependencies (Next.js 14, Tailwind, Lucide)
│   ├── next.config.mjs            # Next.js configuration
│   └── .env.example               # Environment variables example
├── genlayer.config.json           # GenLayer Testnet RPC configuration
└── README.md                      # Documentation & deployment guide
```

---

## ⚙️ Smart Contract: `contracts/bug_shield.py`

The contract is written in Python for the GenLayer VM:
- `create_bounty(...)`: Locks native token value in contract escrow.
- `submit_and_evaluate_patch(...)`: Triggers `gl.exec_prompt(audit_prompt)` across GenLayer validators.
- `get_bounty(bounty_id)` & `get_bounty_count()`: View contract state.

---

## 🛠️ Local Development Setup

### 1. Requirements
- Node.js 18+ & npm
- Python 3.10+

### 2. Run Next.js Frontend Locally
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📜 Deploying Contract to GenLayer Testnet

To deploy `contracts/bug_shield.py` to GenLayer Testnet:

```bash
# Set your GenLayer Private Key
export GENLAYER_PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
export GENLAYER_RPC_URL="https://testnet-rpc.genlayer.com"

# Run deployment script
python scripts/deploy.py
```

---

## 🌐 1-Click Deployment to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: BugShield AI fullstack Web3"
git remote add origin https://github.com/YOUR_USERNAME/bugshield-ai.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **New Project** and import your `bugshield-ai` GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Configure **Environment Variables**:
   - `NEXT_PUBLIC_GENLAYER_RPC` = `https://testnet-rpc.genlayer.com`
   - `NEXT_PUBLIC_GENLAYER_CHAIN_ID` = `61999`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = `0xYOUR_DEPLOYED_CONTRACT_ADDRESS`
5. Click **Deploy**.

---

## 🚰 GenLayer Testnet Faucet & Token Guide

1. Network RPC: `https://testnet-rpc.genlayer.com`
2. Chain ID: `61999`
3. Native Symbol: `GEN`
4. Faucet URL: [https://faucet.genlayer.com](https://faucet.genlayer.com)

To request testnet tokens, connect your MetaMask wallet to GenLayer Testnet and claim testnet GEN tokens from the faucet to create real on-chain bounties.
