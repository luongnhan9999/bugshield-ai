declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Bounty {
  id: number;
  creator: string;
  title: string;
  target_repo_url: string;
  vulnerability_description: string;
  expected_fix_criteria: string;
  reward_amount: string;
  status: 0 | 1 | 2; // 0 = OPEN, 1 = RESOLVED, 2 = REJECTED/CANCELLED
  winner: string;
  ai_verdict_reason: string;
  patch_pr_url: string;
}

export const GENLAYER_TESTNET_CONFIG = {
  chainId: "0xF22F", // 61999 in hex
  chainName: "GenLayer Testnet",
  rpcUrls: [process.env.NEXT_PUBLIC_GENLAYER_RPC || "https://testnet-rpc.genlayer.com"],
  nativeCurrency: {
    name: "GenLayer Token",
    symbol: "GEN",
    decimals: 18,
  },
  blockExplorerUrls: ["https://scan.genlayer.com"],
};

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xBugShieldGenLayerTestnetAddress61999";

// Seed bounties for immediate interactive preview & fallback
export const INITIAL_BOUNTIES: Bounty[] = [
  {
    id: 0,
    creator: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    title: "Reentrancy Vulnerability in Vault Escrow Payout",
    target_repo_url: "https://github.com/bugshield-ai/demo-vault",
    vulnerability_description:
      "External call to recipient contract occurs prior to resetting balance state, allowing an attacker contract to recursively call withdraw() and drain protocol funds.",
    expected_fix_criteria:
      "Implement ReentrancyGuard nonReentrant modifier or apply Checks-Effects-Interactions pattern by setting internal balances to zero before balance transfer.",
    reward_amount: "5.0",
    status: 1, // RESOLVED
    winner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    ai_verdict_reason:
      "VALIDATOR CONSENSUS AUDIT: The submitted patch strictly implements the nonReentrant modifier and updates balance states before calling transfer(). Zero secondary security flaws detected. Payout approved.",
    patch_pr_url: "https://github.com/bugshield-ai/demo-vault/pull/12",
  },
  {
    id: 1,
    creator: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    title: "Integer Overflow in Staking Reward Calculator",
    target_repo_url: "https://github.com/bugshield-ai/staking-rewards",
    vulnerability_description:
      "High multiplier precision calculation `stakedAmount * rewardRate * duration` overflows standard uint256 under high liquidity scenarios.",
    expected_fix_criteria:
      "Scale calculations using OpenZeppelin Math library or SafeMath with proper precision division ordering.",
    reward_amount: "2.5",
    status: 0, // OPEN
    winner: "",
    ai_verdict_reason: "",
    patch_pr_url: "",
  },
  {
    id: 2,
    creator: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    title: "Unrestricted Owner Access in Emergency Withdrawal",
    target_repo_url: "https://github.com/bugshield-ai/dao-governance",
    vulnerability_description:
      "Emergency withdraw function lacks onlyOwner / Timelock constraint, allowing any user to invoke emergency shutdown.",
    expected_fix_criteria:
      "Add AccessControl role checker or AccessControlEnumerable DEFAULT_ADMIN_ROLE constraint.",
    reward_amount: "10.0",
    status: 0, // OPEN
    winner: "",
    ai_verdict_reason: "",
    patch_pr_url: "",
  },
];

export async function connectWallet(): Promise<string | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    alert("MetaMask or a Web3 compatible browser extension was not detected.");
    return null;
  }

  try {
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    // Attempt network switch to GenLayer Testnet
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: GENLAYER_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [GENLAYER_TESTNET_CONFIG],
        });
      }
    }

    return accounts[0] || null;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return null;
  }
}

/**
 * Fetch all bounties from GenLayer RPC or return active state list
 */
export async function getBountiesFromRPC(): Promise<Bounty[]> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_GENLAYER_RPC || "https://testnet-rpc.genlayer.com";
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "gen_getContractState",
        params: [CONTRACT_ADDRESS],
        id: 1,
      }),
    });

    const data = await res.json();
    if (data.result && data.result.bounties) {
      return Object.values(data.result.bounties) as Bounty[];
    }
  } catch (err) {
    console.warn("Could not fetch remote GenLayer RPC state. Using local/cached state.", err);
  }
  return INITIAL_BOUNTIES;
}
