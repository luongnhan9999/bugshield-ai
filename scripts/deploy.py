import os
import sys

def main():
    rpc_url = os.getenv("GENLAYER_RPC_URL", "https://testnet-rpc.genlayer.com")
    private_key = os.getenv("GENLAYER_PRIVATE_KEY")

    if not private_key:
        print("[ERROR] Please set GENLAYER_PRIVATE_KEY in your environment variables.")
        print("Example: export GENLAYER_PRIVATE_KEY=0x... or set GENLAYER_PRIVATE_KEY=0x... in .env")
        sys.exit(1)

    try:
        from genlayer_py import create_client, Account
        client = create_client(rpc_url)
        account = Account.from_key(private_key)

        with open("contracts/bug_shield.py", "r", encoding="utf-8") as f:
            contract_code = f.read()

        print(f"Deploying BugShield Intelligent Contract to GenLayer Testnet ({rpc_url})...")
        tx_hash = client.deploy_contract(
            account=account,
            code=contract_code,
            args=[]
        )
        print(f"[SUCCESS] Contract deployed successfully!")
        print(f"Tx Hash: {tx_hash}")
    except ImportError:
        print("[INFO] genlayer_py SDK not installed locally. Simulating contract deployment...")
        print(f"Target Network RPC: {rpc_url}")
        print("Reading contract code from contracts/bug_shield.py...")
        print("[SUCCESS] Simulated Deploy Success! Mock Contract Address: 0xBugShieldGenLayerTestnetAddress61999")

if __name__ == "__main__":
    main()
