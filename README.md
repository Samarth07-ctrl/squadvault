# 🚀 SquadVault (CampusPool)
### A Decentralized Shared Expense Manager on Algorand

> Trust the code. Not the treasurer.

SquadVault is a Hybrid Web2 + Web3 decentralized application (dApp) that enables student communities, roommates, and teams to manage shared expenses using immutable smart contracts on the Algorand blockchain.

It replaces spreadsheets, WhatsApp reminders, and trust-based systems with verifiable on-chain logic.

---

## 🌍 Why SquadVault?

Managing shared expenses typically results in:

- ❌ Disputes over who paid
- ❌ Lack of transparency
- ❌ Centralized control of funds
- ❌ Manual tracking errors
- ❌ Payment reminders chaos

SquadVault eliminates these problems using blockchain-enforced contribution rules.

---

## 🧠 Core Idea

Each expense pool is deployed as a **Stateful Smart Contract** on Algorand.

The smart contract:

- Enforces exact contribution amount
- Records payment status on-chain
- Prevents underpayment or manipulation
- Maintains immutable member states
- Controls withdrawal permissions

If it's not on-chain, it didn't happen.

---

# 🔗 System Architecture

## 🔐 1️⃣ Blockchain Layer (Trust Layer)

- **Network:** Algorand Testnet
- **Smart Contract Type:** Stateful Application
- **Language:** TEAL
- **SDK:** algosdk (JavaScript)

### On-Chain Storage
- Pool Creator
- Contribution Amount
- Pool Balance
- Member Payment Status (`HasPaid`)
- Contract State Validation

### Security Mechanisms
- Atomic Group Transactions
- Signature verification
- Strict payment amount validation
- Creator-only withdrawal logic

---

## ⚙ 2️⃣ Backend Layer (Logic & Sync)

- Node.js
- Express.js
- MongoDB Atlas
- Blockchain Event Listener

### Responsibilities
- Store pool metadata
- Index transactions
- Maintain member database
- Sync on-chain updates to UI
- Provide fast API responses

Hybrid design ensures:
- Blockchain = Trust
- Backend = Speed

---

## 🎨 3️⃣ Frontend Layer (User Interface)

- React (Vite)
- Tailwind CSS
- React Router DOM
- Pera Wallet Integration

### Features
- Wallet-based authentication
- Real-time pool dashboard
- Payment status indicators
- Due date alerts
- One-click ALGO payment
- Seamless Web2 + Web3 UX

---

# 🔄 Core Workflows

## 🟢 Create Pool

1. User enters pool details
2. Smart contract is deployed
3. Unique App ID generated
4. Metadata stored in MongoDB

---

## 🟡 Join Pool

1. User opts into smart contract
2. Local state allocated on-chain
3. Member added to pool database

---

## 🔵 Pay Contribution

Uses Atomic Group Transactions:

- Txn 1 → ALGO Payment to Contract
- Txn 2 → Application Call ("pay")

Smart Contract Validates:
- Correct amount paid
- Payment receiver is contract
- Transactions are signed

If valid:

Payment permanently recorded on-chain.

---

## 🔴 Withdraw Funds

- Only pool creator can execute
- Smart contract verifies caller
- Funds transferred securely
- Fully transparent & auditable

---

# 🔥 Hybrid Architecture Model

| Layer | Purpose |
|-------|----------|
| Blockchain | Financial enforcement & trust |
| Backend | Metadata & performance |
| Frontend | User interaction |

This design maintains decentralization while preserving usability.

---

# 🛠 Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Samarth07-ctrl/squadvault.git
cd squadvault
