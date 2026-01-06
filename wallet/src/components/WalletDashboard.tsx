import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletService, TransactionParams } from '@/services/wallet';
import { RpcService } from '@/services/rpc';
import TransactionForm from './TransactionForm';
import SignedOutput from './SignedOutput';

interface WalletDashboardProps {
    wallet: ethers.HDNodeWallet | ethers.Wallet;
    onLogout: () => void;
}

export default function WalletDashboard({ wallet, onLogout }: WalletDashboardProps) {
    const [signedTx, setSignedTx] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [mode, setMode] = useState<'online' | 'offline'>('online');
    const [balance, setBalance] = useState<string>('0.0');
    const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        if (mode === 'online') {
            fetchBalance();
        }
    }, [mode]);

    const fetchBalance = async () => {
        setLoading(true);
        setFetchError(false);
        try {
            const bal = await RpcService.getBalance(wallet.address);
            setBalance(bal);
        } catch (err) {
            console.error(err);
            setFetchError(true);
        }
        setLoading(false);
    };

    const handleSignOrSend = async (params: TransactionParams) => {
        setSignedTx(null);
        setTxHash(null);

        try {
            const signed = await WalletService.signTransaction(wallet, params);
            setSignedTx(signed);

            if (mode === 'online') {
                const hash = await RpcService.broadcastTransaction(signed);
                setTxHash(hash);
                // Refresh balance
                setTimeout(fetchBalance, 5000);
            }
        } catch (e: any) {
            console.error(e);
            alert('Transaction Failed: ' + (e.message || 'Unknown error'));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-32 max-w-4xl">
            {/* HEADER */}
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-black text-emerald-500 tracking-tight">GITFI</h1>
                    <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${mode === 'online' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        {mode}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setMode(mode === 'online' ? 'offline' : 'online')} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">
                        SWITCH TO {mode === 'online' ? 'OFFLINE' : 'ONLINE'}
                    </button>
                    <div className="h-4 w-[1px] bg-zinc-800"></div>
                    <button
                        onClick={onLogout}
                        className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors uppercase"
                    >
                        LOCK
                    </button>
                </div>
            </header>

            {/* BALANCE CARD */}
            <div className="mb-8 p-6 bg-gradient-to-br from-zinc-900 to-black rounded-xl border border-zinc-800 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1">TOTAL BALANCE</label>
                        <div className="text-4xl md:text-5xl font-mono text-white tracking-tighter">
                            {mode === 'online' ? (
                                loading ? '...' : (fetchError ? <span className="text-red-500 text-lg">Network Error</span> : `${Number(balance).toFixed(4)} ETH`)
                            ) : '--'}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-emerald-400 break-all text-xs md:text-sm bg-zinc-950/50 px-3 py-1 rounded-full border border-emerald-900/30">
                            {wallet.address}
                        </div>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex space-x-1 bg-zinc-900 p-1 rounded-lg mb-6 w-full max-w-md mx-auto">
                <button onClick={() => setActiveTab('send')} className={`flex-1 py-2 text-sm font-bold font-mono rounded ${activeTab === 'send' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>SEND</button>
                <button onClick={() => setActiveTab('receive')} className={`flex-1 py-2 text-sm font-bold font-mono rounded ${activeTab === 'receive' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>RECEIVE</button>
            </div>

            {activeTab === 'send' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <TransactionForm onSign={handleSignOrSend} />
                    </div>
                    <div>
                        {signedTx ? (
                            <div className="space-y-6">
                                {txHash && (
                                    <div className="p-4 bg-emerald-900/20 border border-emerald-900 rounded-lg">
                                        <div className="text-emerald-400 font-bold text-sm mb-1">TRANSACTION BROADCASTED</div>
                                        <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-emerald-600 underline break-all">
                                            {txHash}
                                        </a>
                                    </div>
                                )}
                                <SignedOutput signedTx={signedTx} />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-12 text-zinc-600 border border-zinc-800 border-dashed rounded-lg font-mono text-sm text-center">
                                {mode === 'online' ? 'OUTPUT WILL APPEAR AFTER SENDING' : 'SIGNED OUTPUT QR WILL APPEAR HERE'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'receive' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <SignedOutput signedTx={wallet.address} />
                    {/* Reusing SignedOutput for QR display of address, though prop name is signedTx, it works for any string */}
                    <p className="text-zinc-400 text-sm font-mono max-w-xs text-center">Scan to deposit ETH to this address on Sepolia Network.</p>
                </div>
            )}
        </div>
    );
}
