# Decentralized Shared Expense Pool for Campus Communities (Algorand)
## Project Architecture & Technical Plan

This document outlines the complete architectural design and technical plan for building a decentralized shared expense pool application on the Algorand blockchain.

---

## 1. System Architecture

The system follows a standard **dApp (Decentralized Application)** architecture with three main layers:

1.  **Frontend (Client Layer)**: A React.js web application that users interact with. It connects to the user's Algorand wallet (Pera Wallet/Defly) to sign transactions.
2.  **Backend (Server Layer)**: A Node.js/Express server that handles off-chain logic, database operations (for caching and user metadata), and facilitates complex interactions like UPI payment verification.
3.  **Blockchain (Trust Layer)**: The Algorand blockchain where the smart contracts reside. This layer handles the core logic of the expense pool (contributions, rules, fund management) ensuring transparency and security.

### High-Level Diagram
```
[User] <--> [Frontend (React)] <--> [Algorand Wallet (Pera)]
                    |
                    v
            [Backend API (Node.js)] <--> [Database (MongoDB)]
                    |
                    v
        [Algorand Blockchain (Smart Contracts)]
```

---

## 2. Modules & Components

### A. Frontend Modules
*   **Authentication**: Connect/Disconnect Wallet (Pera/WalletConnect).
*   **Dashboard**: Overview of user's active pools and recent activity.
*   **Pool Management**:
    *   Create Pool Form (Title, Description, Monthly Contribution, Penalties).
    *   Join Pool (Enter Pool ID).
    *   Pool Details View (Members list, Contribution status).
*   **Payments**:
    *   Contribute Funds (Algorand Transaction).
    *   Record UPI Payment (Form to submit transaction reference).
*   **Notifications**: Alerts for due dates and successful payments.

### B. Backend Modules
*   **User Service**: Manages user profiles linked to wallet addresses.
*   **Pool Service**: Caches pool data from blockchain for faster retrieval.
*   **Transaction Service**: Monitors blockchain for payment events and updates status.
*   **UPI Verify Service**: Logic to verify or log off-chain fiat payments (simulated or via API).

### C. Smart Contract Modules (PyTeal)
*   **Pool App**: The main application.
    *   `create_pool`: Initializes a new expense pool.
    *   `join_pool`: Allows a user to opt-in to the pool.
    *   `pay_contribution`: Accepts ALGO payments and updates user's balance.
    *   `withdraw_funds`: Allows authorized withdrawal (e.g., to pay a vendor).
    *   `penalize_user`: Deducts amounts for late payments.

---

## 3. Database Design (MongoDB)

Since blockchain reads can be slow/complex for filtering, we use MongoDB to index data for the UI.

**Users Collection**
```json
{
  "_id": "wallet_address_string",
  "name": "Student Name",
  "email": "student@university.edu",
  "joined_pools": ["pool_id_1", "pool_id_2"]
}
```

**Pools Collection**
```json
{
  "_id": "app_id_from_blockchain",
  "creator_address": "wallet_address",
  "name": "Apt 4B Groceries",
  "description": "Shared groceries for October",
  "monthly_contribution": 5000000, // microAlgos
  "members": ["wallet_address_1", "wallet_address_2"],
  "created_at": "timestamp"
}
```

**Transactions Collection** (Off-chain tracking)
```json
{
  "_id": "tx_id",
  "pool_id": "app_id",
  "user_address": "wallet_address",
  "amount": 100,
  "currency": "INR", // or ALGO
  "type": "CONTRIBUTION" | "PENALTY" | "EXPENSE",
  "status": "PENDING" | "CONFIRMED",
  "proof": "upi_ref_id_or_algo_tx_id"
}
```

---

## 4. Smart Contract Structure

We will use **PyTeal** to write the smart contract.

**Global State (App State)**
*   `Admin`: Address of the pool creator.
*   `ContributionAmount`: Required amount per member.
*   `DueDate`: Timestamp for payment.
*   `PenaltyAmount`: Amount charged for late payment.
*   `TotalBalance`: Current funds in the smart contract.

**Local State (Per User State)**
*   `HasPaid`: Boolean (0 or 1).
*   `AmountContributed`: Total ALGO sent by user.
*   `JoinedAt`: Timestamp.

---

## 5. Proposed Folder Structure

```
/campus-expense-pool
├── /backend            # Node.js + Express + MongoDB
│   ├── /src
│   │   ├── /controllers
│   │   ├── /models
│   │   ├── /routes
│   │   ├── /services
│   │   ├── /utils
│   │   └── server.js
│   ├── .env
│   ├── package.json
│
├── /frontend           # React + Vite + Tailwind
│   ├── /src
│   │   ├── /assets
│   │   ├── /components
│   │   │   ├── /ui      # Reusable UI components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   ├── /contexts    # Wallet context
│   │   ├── /hooks
│   │   ├── /pages
│   │   │   ├── Home.jsx
│   │   │   ├── CreatePool.jsx
│   │   │   ├── PoolDetails.jsx
│   │   ├── /services    # API and Blockchain interactions
│   │   └── App.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── /smart_contracts    # PyTeal Contracts
    ├── contract.py     # Main logic
    ├── deploy.py       # Deployment script
    ├── utils.py
    └── requirements.txt
```

---

## 6. Technology Choices & Rationale

*   **Frontend**: React (Vite) for speed and component reusability. Tailwind CSS for rapid styling. Pera Wallet for best-in-class Algorand mobile wallet support.
*   **Backend**: Node.js is lightweight and handles async tasks (like watching blockchain events) efficiently.
*   **Database**: MongoDB is flexible for storing variable metadata about pools that doesn't need to be on-chain (like images or long descriptions).
*   **Blockchain**: Algorand. Why?
    *   **Low Fees**: < $0.001 per transaction, essential for student use.
    *   **Speed**: Finality in < 4 seconds.
    *   **Atomic Transfers**: Safe money movement.
    *   **Smart Contracts (AVM)**: Powerful logic for pool rules.

---

## 7. Security Considerations

1.  **Smart Contract Audits**: Ensure math logic is correct (e.g., checking balances before withdrawal).
2.  **Access Control**: Only the pool creator (Admin) can change rules (logic enforced in TEAL).
3.  **Fund Safety**: The smart contract holds the funds, not the backend server. No one can "run away" with funds unless the contract logic permits it.
4.  **Bot Protection**: Use Captcha on frontend for creation forms.
5.  **Data Validation**: Validate all inputs on both frontend and backend.
---

## 8. Development & Deployment Plan

**Phase 1: Setup & Core (We are here)**
*   Initialize repositories.
*   Setup simple frontend and backend servers.

**Phase 2: Authentication**
*   Implement WalletConnect logic.

**Phase 3: Smart Contract**
*   Write PyTeal contract for pooling.
*   Compile to TEAL and test on LocalNet/TestNet.

**Phase 4: Integration**
*   Connect Frontend forms to Smart Contract calls.
*   Build backend listeners to index events.

**Phase 5: Payments & Polish**
*   Add UPI flow logic (manual verification for MVP).
*   UI/UX improvements.

**Phase 6: Deployment**
*   Frontend -> Vercel/Netlify.
*   Backend -> Render/Heroku.
*   Smart Contract -> Algorand Mainnet.
