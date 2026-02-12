import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { PeraWalletConnect } from "@perawallet/connect";
import WalletConnect from './components/WalletConnect'
import CreatePool from './pages/CreatePool';
import Dashboard from './pages/Dashboard';
import PoolDetails from './pages/PoolDetails';

const peraWallet = new PeraWalletConnect();

function App() {
  const [accountAddress, setAccountAddress] = useState(null);

  useEffect(() => {
    // Reconnect to the session when the component mounts
    peraWallet.reconnectSession().then((accounts) => {
      peraWallet.connector?.on("disconnect", handleDisconnectWallet);
      if (accounts.length) {
        setAccountAddress(accounts[0]);
      }
    });

    return () => {
      if (peraWallet.connector) {
        peraWallet.connector.off("disconnect", handleDisconnectWallet);
      }
    }
  }, []);

  const handleDisconnectWallet = () => {
    peraWallet.disconnect();
    setAccountAddress(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans">
        <nav className="bg-slate-950/80 border-b border-slate-800/80 backdrop-blur">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center gap-2 py-3 text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 text-lg font-black shadow-lg">
                ₳
              </span>
              <span>CampusPool</span>
            </Link>
            <WalletConnect
              accountAddress={accountAddress}
              setAccountAddress={setAccountAddress}
              peraWallet={peraWallet}
            />
          </div>
        </nav>

        <main className="px-4 pb-10 pt-6">
          <Routes>
            <Route path="/" element={
              accountAddress ? <Navigate to="/dashboard" /> : (
                <div className="max-w-6xl mx-auto mt-16 md:mt-24">
                  <div className="grid gap-10 md:grid-cols-[3fr,2fr] items-center">
                    {/* Hero copy */}
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-200 mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live on Algorand TestNet · Transparent roommate splits
                      </div>
                      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                        Decentralized Shared
                        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500">
                          Expenses for Campus &amp; Clubs
                        </span>
                      </h1>
                      <p className="text-base md:text-lg text-slate-300/90 mb-6 max-w-xl">
                        Spin up on-chain expense pools for flats, friend groups, and societies.
                        Every contribution is verifiable on Algorand, every member sees the same truth.
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <Link
                          to="/create"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-slate-900 font-semibold shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:shadow-[0_0_40px_rgba(248,250,252,0.45)] transition"
                        >
                          <span>Create your first pool</span>
                          <span className="text-lg">→</span>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Connect Pera Wallet to start</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="rounded-xl bg-slate-900/80 border border-slate-700/70 px-3 py-3">
                          <div className="text-slate-400 mb-1">Gas‑efficient</div>
                          <div className="font-semibold text-slate-50">Algorand smart contracts</div>
                        </div>
                        <div className="rounded-xl bg-slate-900/80 border border-slate-700/70 px-3 py-3">
                          <div className="text-slate-400 mb-1">Roommate‑friendly</div>
                          <div className="font-semibold text-slate-50">Pools for any group</div>
                        </div>
                        <div className="rounded-xl bg-slate-900/80 border border-slate-700/70 px-3 py-3 sm:col-span-1 col-span-2">
                          <div className="text-slate-400 mb-1">Crystal clear</div>
                          <div className="font-semibold text-slate-50">Every payment on‑chain</div>
                        </div>
                      </div>
                    </div>

                    {/* Right side: glassmorphism card */}
                    <div className="relative">
                      <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />
                      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

                      <div className="relative rounded-2xl bg-slate-900/70 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-xs uppercase tracking-wide text-slate-400">
                              Preview
                            </div>
                            <div className="text-sm font-semibold text-slate-100">
                              Roommate Pool · 4B Apartment
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-500/40">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live on-chain
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Monthly contribution</span>
                            <span className="font-semibold text-yellow-300">5.00 ALGO</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Members</span>
                            <span className="font-mono text-slate-200">3 / 5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Next due date</span>
                            <span className="text-slate-100">01 Apr 2026</span>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-2 text-[11px] text-slate-400 border-t border-slate-800 pt-4">
                          <div className="flex items-center justify-between">
                            <span>CampusPool smart contract</span>
                            <span className="font-mono text-slate-500">
                              #7554…7419
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Backed by Algorand · Pera Wallet</span>
                            <span className="text-yellow-300">TestNet</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            } />
            <Route path="/dashboard" element={<Dashboard accountAddress={accountAddress} peraWallet={peraWallet} />} />
            <Route path="/pool/:poolId" element={<PoolDetails accountAddress={accountAddress} peraWallet={peraWallet} />} />
            <Route path="/create" element={<CreatePool accountAddress={accountAddress} peraWallet={peraWallet} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
