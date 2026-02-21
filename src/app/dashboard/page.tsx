"use client";

import { RecentTransfers } from '@/components/RecentTransfers';
import { SendMoneyEngine } from '@/components/SendMoneyEngine';
import { TransferTracker } from '@/components/TransferTracker';
import { LinkedBanks } from '@/components/LinkedBanks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [transferStatus, setTransferStatus] = useState<any>('idle');

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
    <main className="min-h-screen pb-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-white selection:bg-blue-100">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 hidden sm:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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
              <Link href="/dashboard/profile" className="text-sm font-medium text-slate-500 hover:text-[#0A1128] transition hidden md:block">Profile</Link>
              <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-[#0A1128] transition bg-slate-100 px-4 py-2 rounded-lg">Log out</button>
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
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/profile" className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">Profile</Link>
          <button onClick={handleLogout} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">Log out</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0A1128] tracking-tight mb-4">
            Send Money Globally.
          </h1>
          <p className="text-lg text-slate-600 mb-8 font-medium">
            Fast, transparent international transfers with real exchange rates.
          </p>
        </div>

        {/* Main Application Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">

          {/* Column 1: Funding and Recent Transfers */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col space-y-6">
            <LinkedBanks />
            <RecentTransfers />
          </div>

          {/* Column 2: Send Money Engine (Primary) */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center">
            <div className="w-full max-w-2xl">
              <SendMoneyEngine onStatusChange={setTransferStatus} />
            </div>
          </div>

          {/* Column 3: Transfer Tracker */}
          <div className="lg:col-span-3 xl:col-span-3">
            <TransferTracker status={transferStatus} />
          </div>

        </div>
      </div>
    </main>
  );
}
