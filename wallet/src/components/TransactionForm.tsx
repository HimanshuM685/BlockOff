import React, { useState } from 'react';
import { TransactionParams } from '@/services/wallet';

interface TransactionFormProps {
    onSign: (params: TransactionParams) => void;
}

export default function TransactionForm({ onSign }: TransactionFormProps) {
    const [params, setParams] = useState<TransactionParams>({
        to: '',
        value: '',
        gasLimit: '21000',
        maxFeePerGas: '',
        maxPriorityFeePerGas: '',
        nonce: 0,
        chainId: 11155111, // Sepolia
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setParams((prev) => ({
            ...prev,
            [name]: name === 'nonce' || name === 'chainId' ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSign(params);
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-emerald-400 font-mono">Construct Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">RECIPIENT ADDRESS</label>
                    <input
                        type="text"
                        name="to"
                        value={params.to}
                        onChange={handleChange}
                        placeholder="0x..."
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">AMOUNT (ETH)</label>
                        <input
                            type="text"
                            name="value"
                            value={params.value}
                            onChange={handleChange}
                            placeholder="0.0"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">NONCE</label>
                        <input
                            type="number"
                            name="nonce"
                            value={params.nonce}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">GAS LIMIT</label>
                        <input
                            type="number"
                            name="gasLimit"
                            value={params.gasLimit}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">CHAIN ID</label>
                        <input
                            type="number"
                            name="chainId"
                            value={params.chainId}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">MAX FEE (Gwei)</label>
                        <input
                            type="text"
                            name="maxFeePerGas"
                            value={params.maxFeePerGas}
                            onChange={handleChange}
                            placeholder="Basic: 10"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">PRIORITY FEE (Gwei)</label>
                        <input
                            type="text"
                            name="maxPriorityFeePerGas"
                            value={params.maxPriorityFeePerGas}
                            onChange={handleChange}
                            placeholder="Tip: 1"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 rounded font-mono transition-colors mt-6"
                >
                    SIGN TRANSACTION (OFFLINE)
                </button>
            </form>
        </div>
    );
}
