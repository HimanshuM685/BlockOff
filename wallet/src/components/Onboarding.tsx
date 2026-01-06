import React, { useState } from 'react';
import { WalletService } from '@/services/wallet';
import { PersistenceService } from '@/services/persistence';
import { ethers } from 'ethers';

interface OnboardingProps {
    onWalletReady: (wallet: ethers.Wallet | ethers.HDNodeWallet) => void;
}

export default function Onboarding({ onWalletReady }: OnboardingProps) {
    const [step, setStep] = useState<'welcome' | 'create_password' | 'import_input'>('welcome');
    const [wallet, setWallet] = useState<ethers.Wallet | ethers.HDNodeWallet | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [importInput, setImportInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const startCreate = () => {
        const newWallet = WalletService.generateWallet();
        setWallet(newWallet);
        setStep('create_password');
    };

    const startImport = () => {
        setStep('import_input');
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const importedWallet = WalletService.importWallet(importInput);
            setWallet(importedWallet);
            setStep('create_password');
            setError('');
        } catch (err) {
            setError('Invalid mnemonic or private key');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!wallet) return;

        setLoading(true);
        // Timeout to render "Encrypting"
        setTimeout(async () => {
            try {
                const encrypted = await WalletService.encryptWallet(wallet, password);
                PersistenceService.saveWallet(encrypted);
                onWalletReady(wallet);
            } catch (e) {
                console.error(e);
                setError('Encryption failed');
                setLoading(false);
            }
        }, 100);
    };

    if (step === 'welcome') {
        return (
            <div className="flex flex-col space-y-4 w-full max-w-sm mx-auto mt-20 p-6">
                <h1 className="text-4xl font-black text-center text-emerald-500 mb-2 tracking-tighter">GITFI WALLET</h1>
                <p className="text-zinc-500 text-center text-xs font-mono mb-8">SECURE • PERSISTENT • ETHEREUM</p>

                <button
                    onClick={startCreate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-4 rounded-lg font-mono transition-all hover:scale-105 shadow-lg shadow-emerald-900/20"
                >
                    CREATE NEW WALLET
                </button>
                <button
                    onClick={startImport}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-lg font-mono border border-zinc-700 transition-all hover:scale-105"
                >
                    IMPORT WALLET
                </button>
            </div>
        );
    }

    if (step === 'import_input') {
        return (
            <div className="w-full max-w-md mx-auto p-6 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 mt-10 relative">
                <button onClick={() => setStep('welcome')} className="absolute top-4 right-4 text-zinc-500 hover:text-white">✕</button>
                <form onSubmit={handleImportSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold text-emerald-400 font-mono mb-4">IMPORT SECRETS</h2>
                    <textarea
                        value={importInput}
                        onChange={(e) => setImportInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none h-32"
                        placeholder="Enter 12/24 words or 0x..."
                        required
                    />
                    {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 rounded font-mono">CONTINUE</button>
                </form>
            </div>
        );
    }

    // Create Password Step (Shared for Create & Import)
    return (
        <div className="w-full max-w-md mx-auto p-6 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 mt-10">
            <h2 className="text-xl font-bold text-emerald-400 font-mono mb-4">PROTECT YOUR WALLET</h2>
            <p className="text-zinc-400 text-xs mb-6">This password will encrypt your keys on this device. We cannot recover it for you.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-xs font-mono">{error}</p>}

                <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-bold py-3 rounded font-mono">
                    {loading ? 'ENCRYPTING...' : 'FINISH SETUP'}
                </button>
            </form>
        </div>
    );
}
