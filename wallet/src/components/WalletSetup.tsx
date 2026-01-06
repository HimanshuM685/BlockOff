import React, { useState } from 'react';
import { WalletService } from '@/services/wallet';
import { ethers } from 'ethers';

interface WalletSetupProps {
    onWalletReady: (wallet: ethers.HDNodeWallet | ethers.Wallet) => void;
}

export default function WalletSetup({ onWalletReady }: WalletSetupProps) {
    const [mode, setMode] = useState<'create' | 'import' | null>(null);
    const [importInput, setImportInput] = useState('');
    const [error, setError] = useState('');

    const handleCreate = () => {
        // Small delay to allow UI feedback if needed, but for now direct
        const wallet = WalletService.generateWallet();
        onWalletReady(wallet);
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            const wallet = WalletService.importWallet(importInput);
            onWalletReady(wallet);
        } catch (err) {
            setError('Invalid mnemonic or private key');
        }
    };

    if (!mode) {
        return (
            <div className="flex flex-col space-y-4 w-full max-w-sm mx-auto mt-20 p-6">
                <h1 className="text-4xl font-black text-center text-emerald-500 mb-2 tracking-tighter">OFFLINE WALLET</h1>
                <p className="text-zinc-500 text-center text-xs font-mono mb-8">SECURE AIR-GAPPED TRANSACTION SIGNER</p>

                <button
                    onClick={handleCreate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-4 rounded-lg font-mono transition-all hover:scale-105 shadow-lg shadow-emerald-900/20"
                >
                    GENERATE NEW WALLET
                </button>
                <button
                    onClick={() => setMode('import')}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-lg font-mono border border-zinc-700 transition-all hover:scale-105"
                >
                    IMPORT WALLET
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 mt-10 relative">
            <button
                onClick={() => { setMode(null); setError(''); }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
                ✕
            </button>

            {mode === 'import' && (
                <form onSubmit={handleImport} className="space-y-4">
                    <h2 className="text-xl font-bold text-emerald-400 font-mono mb-4">IMPORT WALLET</h2>
                    <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">MNEMONIC PHRASE OR PRIVATE KEY</label>
                        <textarea
                            value={importInput}
                            onChange={(e) => setImportInput(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none h-32"
                            placeholder="Enter 12/24 words or 0x..."
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 rounded font-mono transition-colors"
                    >
                        UNLOCK WALLET
                    </button>
                </form>
            )}
        </div>
    );
}
