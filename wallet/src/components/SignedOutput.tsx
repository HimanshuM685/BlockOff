import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SignedOutputProps {
    signedTx: string;
}

export default function SignedOutput({ signedTx }: SignedOutputProps) {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(signedTx);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-zinc-900 rounded-lg shadow-xl border border-emerald-900 mt-6">
            <h2 className="text-xl font-bold mb-4 text-emerald-400 font-mono">SIGNED TRANSACTION</h2>

            <div className="flex justify-center mb-6 bg-white p-4 rounded">
                <QRCodeSVG value={signedTx} size={256} />
            </div>

            <div className="mb-4">
                <label className="block text-xs font-mono text-zinc-400 mb-1">RAW HEX</label>
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800 break-all font-mono text-xs text-zinc-300 max-h-32 overflow-y-auto">
                    {signedTx}
                </div>
            </div>

            <button
                onClick={copyToClipboard}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded font-mono transition-colors border border-zinc-700"
            >
                {copied ? 'COPIED!' : 'COPY HEX TO CLIPBOARD'}
            </button>
        </div>
    );
}
