'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Onboarding from '@/components/Onboarding';
import UnlockScreen from '@/components/UnlockScreen';
import WalletDashboard from '@/components/WalletDashboard';
import { PersistenceService } from '@/services/persistence';

export default function Home() {
  const [view, setView] = useState<'loading' | 'onboarding' | 'unlock' | 'dashboard'>('loading');
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | ethers.Wallet | null>(null);

  useEffect(() => {
    // Initial check
    const hasWallet = PersistenceService.hasWallet();
    if (hasWallet) {
      setView('unlock');
    } else {
      setView('onboarding');
    }
  }, []);

  const handleWalletReady = (readyWallet: ethers.HDNodeWallet | ethers.Wallet) => {
    setWallet(readyWallet);
    setView('dashboard');
  };

  const handleReset = () => {
    PersistenceService.clearWallet();
    setWallet(null);
    setView('onboarding');
  };

  if (view === 'loading') return null; // Or a spinner

  return (
    <main className="min-h-screen bg-zinc-950 text-gray-100 flex flex-col">
      {view === 'onboarding' && <Onboarding onWalletReady={handleWalletReady} />}

      {view === 'unlock' && <UnlockScreen onUnlock={handleWalletReady} onReset={handleReset} />}

      {view === 'dashboard' && wallet && (
        <WalletDashboard wallet={wallet} onLogout={() => window.location.reload()} />
      )}

      <footer className="mt-auto py-6 text-center text-zinc-600 font-mono text-xs">
        GITFI WALLET v2.0 • PERSISTENT ENCLAVE
      </footer>
    </main>
  );
}
