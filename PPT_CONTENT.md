# Decentralized Campus Expense Pool - Project Technical Overview

## 1. Project Overview
*   **Project Name**: CampusPool (Decentralized Shared Expense Manager)
*   **Tagline**: "Transparent, auditable, and automated expense sharing for student communities on the Algorand Blockchain."
*   **Core Concept**: Replaces traditional spreadsheets and verbal agreements with immutable smart contracts. every contribution is recorded on-chain, eliminating disputes about "who paid what."

## 2. Problem Statement
*   **Lack of Transparency**: In student clubs or roommates, it's hard to track who has actually paid.
*   **Trust Issues**: Fund managers (treasurers) hold all the money personal accounts, leading to potential misuse or mixing of funds.
*   **Manual Tracking**: Excel sheets are error-prone and hard to maintain in real-time.

## 3. Solution Features
### A. Smart Contract-Based Pools
*   **Immutable Logic**: Each expense pool (e.g., "Trip to Goa", "Hackathon Logistics") is a unique Smart Contract on Algorand.
*   **Defined Rules**: The contract enforces the exact contribution amount. You cannot pay less than required.
*   **Binary State**: A user is strictly "Paid" or "Not Paid" on-chain. No ambiguity.

### B. Hybrid Architecture (Web2 + Web3)
*   **Best of Both Worlds**:
    *   **On-Chain (Web3)**: Critical data (Payments, Fund State, Member Status) is stored on Algorand for security.
    *   **Off-Chain (Web2)**: User profiles, pool descriptions, and detailed transaction history are stored in MongoDB for fast retrieval and rich UI.
*   **Seamless Sync**: The backend listens to blockchain events and updates the database creates a "lag-free" experience.

### C. User Experience
*   **Wallet Connect**: Integrated with Pera Wallet for secure, mobile-first authentication.
*   **Real-Time Dashboard**: See all your active pools, due dates, and payment status in one view.
*   **Visual Feedback**: Red/Green indicators for due dates and payment completion.

## 4. Technical Stack

### Blockchain (The Trust Layer)
*   **Network**: Algorand Testnet.
*   **Language**: TEAL (Transaction Execution Approval Language).
*   **Contract Type**: Stateful Smart Contract (Application).
*   **SDK**: `algosdk` for JavaScript.

### Backend (The Logic Layer)
*   **Runtime**: Node.js.
*   **Framework**: Express.js.
*   **Database**: MongoDB Atlas (Cloud).
*   **API Security**: CORS enabled, Environment Variable protection.

### Frontend (The Interface Layer)
*   **Framework**: React (Vite).
*   **Styling**: Tailwind CSS (via CDN for speed).
*   **Routing**: React Router DOM v6.
*   **Wallet Integration**: `@perawallet/connect`.

## 5. Key Technical Workflows

### Workflow 1: Creating a Pool
1.  **User Action**: Fills form (Name, Amount, Due Date).
2.  **Frontend**: Compiles Smart Contract TEAL code.
3.  **Blockchain**: Sends `ApplicationCreate` transaction to Algorand.
4.  **Result**: Returns a unique `App ID`.
5.  **Backend**: Saves `App ID`, `Creator Address`, and metadata to MongoDB.

### Workflow 2: Joining a Pool
1.  **User Action**: Clicks "Join".
2.  **Blockchain**: Sends `OptIn` transaction to the specific `App ID`.
3.  **Smart Contract**: Allocates local storage (Bytes/Ints) for the user on the chain to track their future payment.
4.  **Backend**: Updates `members` array in MongoDB.

### Workflow 3: Paying Contribution
1.  **User Action**: Clicks "Pay ALGO".
2.  **Atomic Transfer**: The app constructs a **Group Transaction**:
    *   *Txn 1*: Payment of X ALGO from User to Smart Contract Address.
    *   *Txn 2*: Application Call with argument "pay".
3.  **Verification**: The Smart Contract logic verifies:
    *   Is the payment amount == Required amount?
    *   Did the user sign both transactions?
4.  **State Update**: If valid, the contract updates the user's local state `HasPaid = 1`.
5.  **Record**: Backend indexes this transaction for the UI history.

## 6. Smart Contract Logic (TEAL Details)
The contract handles 4 main branches:
1.  **Creation**: Sets global `Creator`, `PoolName`, and `ContributionAmount`.
2.  **OptIn**: Initializes local state for a new member.
3.  **Pay**:
    *   Checks `Gtxn[1].Amount == App.Global("ContributionAmount")`.
    *   Checks `Gtxn[1].Receiver == Global.CurrentApplicationAddress`.
    *   Sets `App.Local("HasPaid") = 1`.
4.  **Withdraw**: (Admin Only) Allows the creator to pull accumulated funds.

## 7. Future Roadmap
*   **UPI Integration**: Verify fiat payments via bank APIs and issue "Proof of Payment" tokens on-chain.
*   **Stablecoins**: Support USDC/USDT for stable value storage.
*   **Dispute Resolution**: Voting mechanism for members to approve expenses.
