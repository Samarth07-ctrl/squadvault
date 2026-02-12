# Deployment Guide

This guide explains how to deploy the Campus Expense Pool application to the web.

## 1. Prerequisites
*   **GitHub Repository**: Push this code to a GitHub repo.
*   **Vercel Account**: For Frontend.
*   **Render/Heroku/Railway Account**: For Backend.
*   **MongoDB Atlas**: For Database.
*   **Algorand Account**: Mainnet/Testnet account with ALGO.

## 2. Backend Deployment (Render.com)
1.  Create a **New Web Service** on Render.
2.  Connect your GitHub repo.
3.  **Root Directory**: `backend`
4.  **Build Command**: `npm install`
5.  **Start Command**: `node server.js`
6.  **Environment Variables**:
    *   `MONGO_URI`: Your production MongoDB Atlas connection string.
    *   `ALGOD_SERVER`: `https://mainnet-api.algonode.cloud` (or Testnet)
    *   `ALGOD_PORT`: `443`
    *   `ALGOD_TOKEN`: `` (Empty for AlgoNode)

## 3. Frontend Deployment (Vercel)
1.  Import your GitHub repo into Vercel.
2.  **Root Directory**: `frontend`
3.  **Build Command**: `npm run build`
4.  **Output Directory**: `dist`
5.  **Environment Variables**:
    *   *None required unless you want to hide the API URL.*
    *   If you do, update `api.js` to use `import.meta.env.VITE_API_URL`.

## 4. Smart Contract Deployment
1.  Run the deployment script locally to deploy the contract to **Algorand Mainnet**:
    ```bash
    cd smart_contracts
    python deploy.py
    ```
    *Make sure to set your Mainnet mnemonic in the script or env.*
2.  Copy the resulting **App ID**.
3.  You don't need to "host" the python files. The contract lives on the blockchain.

## 5. Domain Setup
1.  On Vercel, add your custom domain (e.g., `campuspool.xyz`).
2.  Update the backend CORS settings if necessary to allow this domain.

---
**Congratulations! Your DApp is live.**
