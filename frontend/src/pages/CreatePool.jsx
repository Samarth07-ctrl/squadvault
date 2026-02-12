import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import algosdk from 'algosdk';
import { getContractParams, createPoolInDb } from '../services/api';

const algodToken = ''; // Use public node or localized env
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = 443;
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const CreatePool = ({ accountAddress, peraWallet }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contributionAmount: '', // in ALGO
        dueDate: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("=== CREATE POOL DEBUG START ===");
        console.log("accountAddress prop:", accountAddress);
        console.log("accountAddress type:", typeof accountAddress);
        console.log("peraWallet exists?", !!peraWallet);
        console.log("=== CREATE POOL DEBUG END ===");

        // Validate wallet address
        if (!accountAddress || typeof accountAddress !== 'string') {
            alert('Please connect wallet first');
            return;
        }

        const cleanAddress = accountAddress.trim();

        if (!algosdk.isValidAddress(cleanAddress)) {
            console.error("Invalid Account Address:", accountAddress);
            alert("Invalid wallet address. Please reconnect your wallet.");
            return;
        }

        setLoading(true);

        try {
            // 1. Get Contract Bytecode
            const { data: contractParams } = await getContractParams();

            const approvalProgram = new Uint8Array(
                atob(contractParams.approvalProgram).split('').map(c => c.charCodeAt(0))
            );
            const clearProgram = new Uint8Array(
                atob(contractParams.clearProgram).split('').map(c => c.charCodeAt(0))
            );

            // 2. Prepare Transaction
            const schema = {
                numLocalInts: contractParams.localSchema.numUint,
                numLocalByteSlices: contractParams.localSchema.numByteSlice,
                numGlobalInts: contractParams.globalSchema.numUint,
                numGlobalByteSlices: contractParams.globalSchema.numByteSlice,
            };

            const params = await algodClient.getTransactionParams().do();

            const appArgs = [
                new TextEncoder().encode(formData.name), // PoolName
                algosdk.encodeUint64(Number(formData.contributionAmount) * 1000000) // ContributionAmount in MicroAlgos
            ];

            console.log('Creating App with params:', {
                from: cleanAddress,
                approvalLength: approvalProgram.length,
                clearLength: clearProgram.length,
                args: appArgs
            });

            console.log("Using Address:", cleanAddress);
            console.log("Using Params:", params);

            // Create application using *FromObject helper (expects `sender`, not `from`)
            const txn = algosdk.makeApplicationCreateTxnFromObject({
                sender: cleanAddress,
                suggestedParams: params,
                onComplete: algosdk.OnApplicationComplete.NoOpOC,
                approvalProgram,
                clearProgram,
                numLocalInts: schema.numLocalInts,
                numLocalByteSlices: schema.numLocalByteSlices,
                numGlobalInts: schema.numGlobalInts,
                numGlobalByteSlices: schema.numGlobalByteSlices,
                appArgs: appArgs,
            });

            // 3. Sign & Send
            const singleTxnGroups = [{ txn, signers: [cleanAddress] }];
            const signedTxnGroup = await peraWallet.signTransaction([singleTxnGroups]); // Uint8Array[]

            // Send signed transaction group directly
            const sendResult = await algodClient.sendRawTransaction(signedTxnGroup).do();
            const txId = sendResult.txId || sendResult.txid;

            console.log('Transaction send result:', sendResult);
            console.log('Using txId for confirmation:', txId);

            // Wait for confirmation (allow more rounds)
            const result = await algosdk.waitForConfirmation(algodClient, txId, 10);
            console.log('waitForConfirmation result:', result);

            // SDK may expose application index as `application-index` or `applicationIndex`
            const appId = result['application-index'] ?? result.applicationIndex;

            if (appId == null) {
                // Try to get more detailed error from pending info
                const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
                console.error('App creation failed, pending info:', pendingInfo);
                const poolError = pendingInfo['pool-error'];
                console.error('Algorand pool-error:', poolError);
                throw new Error(poolError || 'App creation failed: no application-index in confirmation result');
            }

            console.log('App Deployed with appId:', appId);

            // 4. Save to Database
            await createPoolInDb({
                appId: String(appId),
                creator: cleanAddress,
                name: formData.name,
                description: formData.description,
                contributionAmount: Number(formData.contributionAmount) * 1000000,
                dueDate: formData.dueDate,
            });

            alert('Pool Created Successfully!');
            navigate('/dashboard');

        } catch (error) {
            console.log("CreatePool error message:", error?.message);
            console.log("CreatePool error stack:", error?.stack);
            console.log("CreatePool full error object:", error);
            alert('Failed to create pool: ' + (error?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg mt-10 text-white">
            <h2 className="text-3xl font-bold mb-6 text-yellow-400">Create Expense Pool</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-400 mb-2">Pool Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="e.g. Apartment 4B Expenses"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Details about the shared expenses..."
                        rows="3"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 mb-2">Contribution Amount (ALGO)</label>
                    <input
                        type="number"
                        name="contributionAmount"
                        value={formData.contributionAmount}
                        onChange={handleChange}
                        required
                        min="0.1"
                        step="0.1"
                        className="w-full p-3 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="e.g. 5"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 mb-2">Due Date</label>
                    <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-400 text-black hover:bg-yellow-500'
                        }`}
                >
                    {loading ? 'Deploying to Blockchain...' : 'Create Pool'}
                </button>
            </form>
        </div>
    );
};

export default CreatePool;
