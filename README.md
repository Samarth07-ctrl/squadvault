# Decentralized Campus Expense Pool (Algorand)

A decentralized application (dApp) for students to manage shared expenses transparently on the Algorand blockchain.

## 🚀 Quick Start Guide

### Prerequisites
1.  **Pera Wallet Mobile App**: Download and install on your phone.
    *   [iOS](https://apps.apple.com/us/app/pera-algo-wallet/id1459898525) | [Android](https://play.google.com/store/apps/details?id=com.algorand.android)
2.  **Testnet Account**:
    *   In Pera Wallet, go to Settings -> Developer Settings -> Node Settings -> Select **Testnet**.
    *   Create a new account or import one.
3.  **Testnet ALGO**:
    *   Go to the [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/).
    *   Enter your wallet address and get free ALGO.

### How to Run Locally

You need two terminal windows.

**Terminal 1: Backend**
```bash
cd backend
npm install
node server.js
```
*Make sure your `.env` has the correct MongoDB URI.*

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
```
*Access the app at `http://localhost:5173` (or the port shown).*

---

## 📱 How to Use the App

### 1. Connect Wallet
*   Open the app in your browser.
*   Click **"Connect Pera Wallet"** in the top right.
*   Scan the QR code with your Pera Mobile App.

### 2. Create an Expense Pool
*   Click **"+ Create New Pool"** on the Dashboard.
*   **Name**: e.g., "Apt 4B Groceries".
*   **Description**: "Shared costs for October".
*   **Contribution Amount**: Amount in ALGO (e.g., 5).
*   **Due Date**: Select a deadline.
*   Click **"Create Pool"**.
*   **Approve Transaction**: Your phone will prompt you to sign a transaction permanently creating the smart contract on Algorand.

### 3. Join a Pool
*   On the Dashboard, find a pool you want to join.
*   Click **"Join"**.
*   **Opt-In**: This sends a transaction to "Opt-In" to the smart contract, allowing it to store your payment status.

### 4. Pay Your Share
*   Click **"Details"** on the pool card.
*   Review the amount due.
*   Click **"Pay Contribution (ALGO)"**.
*   **Sign Transaction**: Approve the payment in your wallet.
*   Once confirmed, your status will update, and the payment will appear in **Recent Transactions**.

### 5. Verify on Blockchain
*   Copy any "Tx ID" from the transaction list.
*   Paste it into [AlgoExplorer (Testnet)](https://testnet.algoexplorer.io/) to see the immutable record of your payment!

---

## 🛠️ Tech Stack
*   **Frontend**: React, Tailwind CSS, Pera Connect
*   **Backend**: Node.js, Express, MongoDB Atlas
*   **Blockchain**: Algorand (PyTeal Smart Contracts)
