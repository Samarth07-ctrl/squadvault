from algosdk import account, mnemonic, transaction
from algosdk.v2client import algod
import os
from dotenv import load_dotenv

# Load env from backend folder
load_dotenv("../backend/.env")

# Initialize Algorand Client
# Default to LocalNet/Sandbox values if env not found
algod_address = os.getenv("ALGOD_SERVER", "http://localhost:4001")
algod_token = os.getenv("ALGOD_TOKEN", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

print(f"Connecting to Algorand Node at {algod_address}")

algod_client = algod.AlgodClient(algod_token, algod_address)

def compile_program(client, source_code):
    compile_response = client.compile(source_code)
    return base64.b64decode(compile_response['result'])

def deploy_app(creator_mnemonic):
    # Get private key
    creator_private_key = mnemonic.to_private_key(creator_mnemonic)
    creator_address = account.address_from_private_key(creator_private_key)
    print(f"Deploying from Creator Address: {creator_address}")

    # Read TEAL files - Ensure you run 'python contract.py' first!
    try:
        with open("approval.teal", "r") as f:
            approval_source = f.read()
        with open("clear_state.teal", "r") as f:
            clear_state_source = f.read()
    except FileNotFoundError:
        print("Error: TEAL files not found. Run 'python contract.py' first.")
        return

    # Compile
    approval_program = compile_program(algod_client, approval_source)
    clear_state_program = compile_program(algod_client, clear_state_source)

    # Global Schema (Creator=Bytes, PoolName=Bytes, ContributionAmount=Int, TotalFunds=Int)
    # 2 Bytes, 2 Ints
    global_schema = transaction.StateSchema(num_uints=2, num_byte_slices=2)

    # Local Schema (HasPaid=Int, AmountPaid=Int)
    # 2 Ints
    local_schema = transaction.StateSchema(num_uints=2, num_byte_slices=0)

    # Arguments for Creation: [PoolName, ContributionAmount]
    # In a real app, these would be passed dynamically
    app_args = ["My Weekly Groceries", 1000000] # 1 ALGO

    # Create Application Transaction
    txn = transaction.ApplicationCreateTxn(
        sender=creator_address,
        sp=algod_client.suggested_params(),
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_program,
        clear_program=clear_state_program,
        global_schema=global_schema,
        local_schema=local_schema,
        app_args=app_args
    )

    # Sign and Send
    signed_txn = txn.sign(creator_private_key)
    tx_id = signed_txn.transaction_id
    print(f"Deploying App... TxID: {tx_id}")
    
    try:
        algod_client.send_transaction(signed_txn)
        transaction.wait_for_confirmation(algod_client, tx_id, 4)
        
        # Get App ID
        tx_response = algod_client.pending_transaction_info(tx_id)
        app_id = tx_response['application-index']
        print(f"Deployed App ID: {app_id}")
        return app_id
    except Exception as e:
        print(f"Deployment Failed: {e}")

if __name__ == "__main__":
    # REPLACE WITH YOUR SANDBOX/TESTNET MNEMONIC
    # Example Mnemonic (DO NOT USE IN PRODUCTION)
    CREATOR_MNEMONIC = os.getenv("CREATOR_MNEMONIC", "YOUR 25 WORD MNEMONIC HERE")
    
    if "YOUR" in CREATOR_MNEMONIC:
        print("Please set CREATOR_MNEMONIC in .env or script")
    else:
        deploy_app(CREATOR_MNEMONIC)
