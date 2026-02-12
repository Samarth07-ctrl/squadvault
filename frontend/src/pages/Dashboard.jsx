import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import algosdk from 'algosdk';
import { getPools, joinPoolInDb } from '../services/api';

const algodToken = '';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = 443;
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const Dashboard = ({ accountAddress, peraWallet }) => {
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all | joined | open | past
    const [sortBy, setSortBy] = useState('recent'); // recent | due | contribution

    useEffect(() => {
        fetchPools();
    }, []);

    const fetchPools = async () => {
        try {
            const { data } = await getPools();
            setPools(data);
        } catch (error) {
            console.error('Failed to fetch pools:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (pool) => {
        if (!accountAddress) {
            alert("Please connect wallet first");
            return;
        }

        try {
            setJoiningId(pool._id);
            // 1. Opt-In to Smart Contract
            const params = await algodClient.getTransactionParams().do();

            const txn = algosdk.makeApplicationOptInTxnFromObject({
                from: accountAddress,
                appIndex: Number(pool.appId),
                suggestedParams: params
            });

            const singleTxnGroups = [{ txn, signers: [accountAddress] }];
            const signedTxns = await peraWallet.signTransaction([singleTxnGroups]);

            const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
            console.log("Opt-In Sent:", txId);
            await algosdk.waitForConfirmation(algodClient, txId, 4);

            // 2. Update Backend
            await joinPoolInDb({
                appId: pool.appId,
                walletAddress: accountAddress
            });

            alert("Successfully Joined Pool!");
            fetchPools(); // Refresh UI
        } catch (error) {
            console.error(error);
            alert("Failed to join pool: " + (error?.message || 'Unknown error'));
        } finally {
            setJoiningId(null);
        }
    };

    const stats = useMemo(() => {
        const total = pools.length;
        const joined = pools.filter(p => p.members.includes(accountAddress)).length;
        const active = pools.filter(p => new Date(p.dueDate) >= new Date()).length;
        const totalMonthlyAlgo = pools.reduce((sum, p) => sum + (p.contributionAmount || 0), 0) / 1_000_000;
        return { total, joined, active, totalMonthlyAlgo };
    }, [pools, accountAddress]);

    const filteredPools = useMemo(() => {
        let result = [...pools];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q) ||
                p.creator.toLowerCase().includes(q)
            );
        }

        if (filter === 'joined') {
            result = result.filter(p => p.members.includes(accountAddress));
        } else if (filter === 'open') {
            result = result.filter(p => new Date(p.dueDate) >= new Date());
        } else if (filter === 'past') {
            result = result.filter(p => new Date(p.dueDate) < new Date());
        }

        if (sortBy === 'due') {
            result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortBy === 'contribution') {
            result.sort((a, b) => (b.contributionAmount || 0) - (a.contributionAmount || 0));
        } else {
            // recent: newest first by createdAt or appId fallback
            result.sort((a, b) => {
                const aKey = a.createdAt || a.appId;
                const bKey = b.createdAt || b.appId;
                return aKey > bKey ? -1 : 1;
            });
        }

        return result;
    }, [pools, search, filter, sortBy, accountAddress]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 text-white">
            {/* Hero / Header */}
            <div className="mb-8 grid gap-6 md:grid-cols-[2fr,3fr] items-start">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                        Your Shared Expense Pools
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base max-w-xl">
                        Track and manage all your roommate and club expenses in one place.
                        Join existing pools or create a new one in a few seconds.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            to="/create"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold shadow-lg hover:from-yellow-500 hover:to-orange-600 transition"
                        >
                            <span>+ Create New Pool</span>
                        </Link>
                        {accountAddress && (
                            <span className="inline-flex items-center px-3 py-2 rounded-full bg-gray-800/80 border border-gray-700 text-xs font-mono text-gray-300">
                                Connected:&nbsp;
                                <span className="text-yellow-300">
                                    {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/80 p-4 shadow-lg">
                        <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Total Pools</div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-[11px] text-gray-500 mt-1">Across all communities</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-900/40 to-gray-900 rounded-xl border border-blue-800/70 p-4 shadow-lg">
                        <div className="text-xs uppercase tracking-wide text-gray-300 mb-1">Joined</div>
                        <div className="text-2xl font-bold text-blue-300">{stats.joined}</div>
                        <div className="text-[11px] text-blue-200/80 mt-1">Pools you are part of</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-900/40 to-gray-900 rounded-xl border border-emerald-800/70 p-4 shadow-lg">
                        <div className="text-xs uppercase tracking-wide text-gray-300 mb-1">Active</div>
                        <div className="text-2xl font-bold text-emerald-300">{stats.active}</div>
                        <div className="text-[11px] text-emerald-200/80 mt-1">Not past due date</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-900/40 to-gray-900 rounded-xl border border-yellow-700/70 p-4 shadow-lg">
                        <div className="text-xs uppercase tracking-wide text-gray-300 mb-1">Monthly Outflow</div>
                        <div className="text-2xl font-bold text-yellow-300">
                            {stats.totalMonthlyAlgo.toFixed(2)} <span className="text-xs">ALGO</span>
                        </div>
                        <div className="text-[11px] text-yellow-200/80 mt-1">If you join all</div>
                    </div>
                </div>
            </div>

            {/* Filters & search */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex-1 flex gap-3">
                    <div className="relative flex-1">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm">
                            🔍
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search pools by name, description, or creator..."
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/70"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                    <div className="inline-flex bg-gray-900/80 border border-gray-700 rounded-lg overflow-hidden">
                        {['all', 'joined', 'open', 'past'].map((key) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setFilter(key)}
                                className={`px-3 py-2 capitalize transition ${
                                    filter === key
                                        ? 'bg-yellow-400 text-black'
                                        : 'text-gray-300 hover:bg-gray-800'
                                }`}
                            >
                                {key === 'all' ? 'All Pools' :
                                    key === 'joined' ? 'My Pools' :
                                        key === 'open' ? 'Active' : 'Past Due'}
                            </button>
                        ))}
                    </div>

                    <div className="inline-flex bg-gray-900/80 border border-gray-700 rounded-lg overflow-hidden">
                        <span className="px-2 py-2 text-gray-400 hidden md:inline">Sort:</span>
                        {[
                            { key: 'recent', label: 'Newest' },
                            { key: 'due', label: 'Due Date' },
                            { key: 'contribution', label: 'Contribution' },
                        ].map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => setSortBy(opt.key)}
                                className={`px-3 py-2 text-xs transition ${
                                    sortBy === opt.key
                                        ? 'bg-blue-500/80 text-white'
                                        : 'text-gray-300 hover:bg-gray-800'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="w-10 h-10 border-4 border-gray-700 border-t-yellow-400 rounded-full animate-spin mb-4" />
                    <p>Loading pools from the blockchain...</p>
                </div>
            ) : filteredPools.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/80 rounded-2xl border border-dashed border-gray-700">
                    <p className="text-gray-300 text-lg mb-3">
                        No matching pools found.
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                        Try changing your search or filters, or create a new pool for your friends.
                    </p>
                    <Link
                        to="/create"
                        className="inline-flex items-center px-5 py-2.5 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition shadow-lg"
                    >
                        + Create your first pool
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPools.map((pool) => {
                        const isMember = pool.members.includes(accountAddress);
                        const isPastDue = pool.dueDate && new Date(pool.dueDate) < new Date();
                        const contributionAlgo = (pool.contributionAmount / 1_000_000).toFixed(2);

                        return (
                            <div
                                key={pool._id}
                                className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 hover:border-blue-500/70 transition shadow-xl overflow-hidden group"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-60 group-hover:opacity-100" />

                                <div className="p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition">
                                            {pool.name}
                                        </h3>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                isPastDue
                                                    ? 'bg-red-900/60 text-red-300 border border-red-700/60'
                                                    : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                                            }`}
                                        >
                                            {isPastDue ? 'Past Due' : 'Active'}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                                        {pool.description || 'No description provided.'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                                        <div className="bg-gray-900/80 rounded-lg px-3 py-2 border border-gray-800">
                                            <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                                Contribution
                                            </div>
                                            <div className="mt-0.5 font-semibold text-yellow-300">
                                                {contributionAlgo} ALGO
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/80 rounded-lg px-3 py-2 border border-gray-800">
                                            <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                                Members
                                            </div>
                                            <div className="mt-0.5 font-semibold text-blue-200">
                                                {pool.members.length}
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/80 rounded-lg px-3 py-2 border border-gray-800">
                                            <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                                Due Date
                                            </div>
                                            <div
                                                className={`mt-0.5 font-semibold ${
                                                    isPastDue ? 'text-red-400' : 'text-gray-200'
                                                }`}
                                            >
                                                {pool.dueDate
                                                    ? new Date(pool.dueDate).toLocaleDateString()
                                                    : 'No Date'}
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/80 rounded-lg px-3 py-2 border border-gray-800">
                                            <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                                Creator
                                            </div>
                                            <div className="mt-0.5 font-mono text-[11px] text-gray-400">
                                                {pool.creator.slice(0, 6)}...{pool.creator.slice(-4)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex gap-2">
                                        <Link
                                            to={`/pool/${pool.appId}`}
                                            className="flex-1 inline-flex items-center justify-center py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium transition"
                                        >
                                            Details
                                        </Link>
                                        {isMember ? (
                                            <button
                                                disabled
                                                className="flex-1 inline-flex items-center justify-center py-2 rounded-lg bg-emerald-600/80 text-xs font-semibold cursor-default text-white"
                                            >
                                                Joined
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleJoin(pool)}
                                                disabled={joiningId === pool._id}
                                                className={`flex-1 inline-flex items-center justify-center py-2 rounded-lg text-xs font-semibold transition ${
                                                    joiningId === pool._id
                                                        ? 'bg-blue-500/40 text-blue-100 cursor-wait'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                            >
                                                {joiningId === pool._id ? 'Joining…' : 'Join Pool'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
