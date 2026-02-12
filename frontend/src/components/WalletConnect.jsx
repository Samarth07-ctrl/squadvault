import React, { useEffect } from "react";
import { PeraWalletConnect } from "@perawallet/connect";

const WalletConnect = ({ accountAddress, setAccountAddress, peraWallet }) => {
    useEffect(() => {
        // Reconnect to the session when the component mounts
        peraWallet.reconnectSession().then((accounts) => {
            peraWallet.connector?.on("disconnect", handleDisconnectWallet);
            if (accounts.length) {
                setAccountAddress(accounts[0]);
            }
        });

        return () => {
            // cleanup listeners
            if (peraWallet.connector) {
                peraWallet.connector.off("disconnect", handleDisconnectWallet);
            }
        }
    }, []);

    const handleConnectWallet = () => {
        peraWallet
            .connect()
            .then((newAccounts) => {
                peraWallet.connector?.on("disconnect", handleDisconnectWallet);
                setAccountAddress(newAccounts[0]);
            })
            .catch((error) => {
                if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
                    console.log(error);
                }
            });
    };

    const handleDisconnectWallet = () => {
        peraWallet.disconnect();
        setAccountAddress(null);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {accountAddress ? (
                <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-mono bg-gray-100 p-2 rounded">
                        Connected: {accountAddress.slice(0, 6)}...{accountAddress.slice(-6)}
                    </span>
                    <button
                        onClick={handleDisconnectWallet}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleConnectWallet}
                    className="px-6 py-3 bg-yellow-400 text-black font-bold rounded shadow-lg hover:bg-yellow-500 transition"
                >
                    Connect Pera Wallet
                </button>
            )}
        </div>
    );
};

export default WalletConnect;
