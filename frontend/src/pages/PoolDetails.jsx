import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import algosdk from 'algosdk';
import { getPools, getPoolTransactions, recordTransaction } from '../services/api';

const algodToken = '';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = 443;
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const PoolDetails = ({ accountAddress, peraWallet }) => {
    const { poolId } = useParams(); // Note: This is usually the DB ID, but let's assume we map or find it
    const [pool, setPool] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPoolData();
    }, [poolId]);

    const fetchPoolData = async () => {
        try {
            const { data: pools } = await getPools();
            // In a real app we'd have a getPoolById endpoint
            const currentPool = pools.find(p => p.appId === poolId || p._id === poolId);
            setPool(currentPool);

            if (currentPool) {
                const { data: txs } = await getPoolTransactions(currentPool.appId);
                setTransactions(txs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleContribute = async () => {
        if (!accountAddress) return alert("Connect Wallet!");

        try {
            setLoading(true);
            const params = await algodClient.getTransactionParams().do();

            // 1. Payment Transaction
            const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                from: accountAddress,
                to: algosdk.getApplicationAddress(Number(pool.appId)),
                amount: Number(pool.contributionAmount), // Amount from DB
                suggestedParams: params
            });

            // 2. App Call (NoOp) with "pay" arg
            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                from: accountAddress,
                appIndex: Number(pool.appId),
                appArgs: [new TextEncoder().encode("pay")],
                suggestedParams: params
            });

            // Group them
            const group = algosdk.assignGroupID([appCallTxn, paymentTxn]);
            const multipleTxnGroups = [{ txn: appCallTxn, signers: [accountAddress] }, { txn: paymentTxn, signers: [accountAddress] }];

            const signedTxns = await peraWallet.signTransaction([multipleTxnGroups]);

            const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
            console.log("Contribution Sent:", txId);
            await algosdk.waitForConfirmation(algodClient, txId, 4);

            // 3. Record in DB
            await recordTransaction({
                txId,
                poolId: pool.appId,
                sender: accountAddress,
                amount: pool.contributionAmount,
                type: 'CONTRIBUTION'
            });

            alert("Contribution Successful!");
            fetchPoolData();

        } catch (error) {
            console.error(error);
            alert("Contribution Failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
    if (!pool) return <div className="text-white text-center mt-20">Pool not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 text-white">
            <Link to="/dashboard" className="text-gray-400 hover:text-white mb-4 block">← Back to Dashboard</Link>

            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-yellow-400 mb-2">{pool.name}</h1>
                        <p className="text-gray-300">{pool.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Contribution Required</div>
                        <div className="text-2xl font-bold text-green-400">{(pool.contributionAmount / 1000000).toFixed(2)} ALGO</div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button
                        onClick={handleContribute}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold shadow-lg transition transform hover:scale-105"
                    >
                        Pay Contribution (ALGO)
                    </button>
                    <button
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold shadow-lg transition"
                        onClick={() => alert("UPI Integration Coming Soon!")}
                    >
                        Mark Paid via UPI
                    </button>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Recent Transactions</h3>
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No transactions recorded yet.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">Sender</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Tx ID</th>
                                <th className="p-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-gray-750">
                                    <td className="p-4 font-mono text-sm text-blue-300">{tx.sender.slice(0, 6)}...</td>
                                    <td className="p-4 text-green-400 font-bold">{(tx.amount / 1000000).toFixed(2)}</td>
                                    <td className="p-4 text-xs">
                                        <span className="bg-gray-700 px-2 py-1 rounded">{tx.type}</span>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-gray-500">
                                        <a href={`https://testnet.algoexplorer.io/tx/${tx.txId}`} target="_blank" rel="noreferrer" className="hover:underline">
                                            {tx.txId.slice(0, 8)}...
                                        </a>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PoolDetails;
