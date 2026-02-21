"use client";

import dynamic from 'next/dynamic';
import { SendMoney } from '@/components/SendMoney';
import { ReceiveMoney } from '@/components/ReceiveMoney';
import { ArrowRightLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Avoid hydration mismatch for wallet adapter component
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/user').then(res => res.json()).then(data => {
      if (!data.authenticated) {
        router.push('/login');
      } else if (!data.user.isKycComplete) {
        router.push('/kyc');
      } else {
        setIsAuthChecking(false);
      }
    }).catch(() => {
      router.push('/login');
    });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div></div>;
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 hidden sm:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <img src="/logo.svg" alt="GlobePay Logo" className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                GlobePay
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition">Log out</button>
              <WalletMultiButton className="!bg-slate-800 hover:!bg-slate-700 !transition !rounded-xl" />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="sm:hidden flex justify-between items-center p-4 bg-white border-b border-slate-200">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded flex items-center justify-center mr-2">
            <img src="/logo.svg" alt="GlobePay Logo" className="w-6 h-6" />
          </div>
          <span className="text-lg font-bold text-slate-800">GlobePay</span>
        </div>
        <WalletMultiButton className="!bg-slate-800 hover:!bg-slate-700 !transition !rounded-lg !px-3 !py-1 flex-shrink-0" />
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Global transfers, <span className="text-blue-600">instantly.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Send money across borders in seconds with zero hidden fees, powered by Solana's lightning-fast network.
          </p>
        </div>

        {/* Main Application Area */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-8 lg:gap-12 mt-12">

          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <SendMoney />
          </div>

          <div className="hidden md:flex flex-col items-center justify-center h-full self-center">
            <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 z-10 text-slate-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center md:justify-start">
            <ReceiveMoney />
          </div>

        </div>
      </div>
    </main>
  );
}
