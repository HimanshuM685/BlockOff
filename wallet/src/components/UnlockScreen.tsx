import React, { useState } from 'react';
import { WalletService } from '@/services/wallet';
import { PersistenceService } from '@/services/persistence';
import { ethers } from 'ethers';

interface UnlockScreenProps {
    onUnlock: (wallet: ethers.Wallet | ethers.HDNodeWallet) => void;
    onReset: () => void;
}

export default function UnlockScreen({ onUnlock, onReset }: UnlockScreenProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Tiny timeout to allow UI to update to "Decrypting..."
        setTimeout(async () => {
            try {
                const encryptedJson = PersistenceService.loadWallet();
                if (!encryptedJson) {
                    setError('No wallet found.');
                    setLoading(false);
                    return;
                }
                const wallet = await WalletService.decryptWallet(encryptedJson, password);
                onUnlock(wallet);
            } catch (err) {
                console.error(err);
                setError('Incorrect password or corrupted wallet file.');
                setLoading(false);
            }
        }, 100);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-sm mx-auto p-6">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">WELCOME BACK</h1>
            </div>

            <form onSubmit={handleUnlock} className="w-full space-y-4">
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 font-mono text-center text-white focus:border-emerald-500 focus:outline-none"
                        autoFocus
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-xs font-mono text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-bold py-3 rounded font-mono transition-transform active:scale-95"
                >
                    {loading ? 'DECRYPTING...' : 'UNLOCK'}
                </button>
            </form>

            <button
                onClick={() => {
                    if (confirm("This will WIPE the current wallet from this device. Access will be lost if you don't have the seed phrase.")) {
                        onReset();
                    }
                }}
                className="mt-8 text-xs text-zinc-600 hover:text-red-500 transition-colors uppercase font-mono"
            >
                Restore / Reset Wallet
            </button>
        </div>
    );
}
