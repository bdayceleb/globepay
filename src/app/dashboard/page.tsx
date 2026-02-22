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
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isTransfersLoading, setIsTransfersLoading] = useState(true);

  // Polling for real-time updates across the dashboard
  useEffect(() => {
    if (isAuthChecking) return;

    let isMounted = true;
    const pollTransactions = async () => {
      try {
        const res = await fetch('/api/transactions/draft');
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setTransfers(data.transactions);
            setIsTransfersLoading(false);

            // Sync the Transfer Tracker visually if there is a recently spawned transaction
            if (data.transactions.length > 0) {
              const latest = data.transactions[0];
              // Link UI to this transaction if it's strictly from the last 15 minutes
              if (Date.now() - latest.createdAt < 15 * 60 * 1000) {
                setTransferStatus(latest.status);
              }
            }
          }
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    };

    pollTransactions(); // initial fetch
    const interval = setInterval(pollTransactions, 1500); // Poll every 1.5s
    return () => { isMounted = false; clearInterval(interval); };
  }, [isAuthChecking]);

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

      {/* Dashboard Workspace */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16">
        <div className="mb-8 border-b border-slate-200/60 pb-6">
          <h1 className="text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">
            Manage your wallet, track transfers, and send money globally.
          </p>
        </div>

        {/* 2-Column App Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Main Action Area (Left) */}
          <div className="w-full lg:w-7/12 flex flex-col space-y-8">
            <SendMoneyEngine onStatusChange={setTransferStatus} />
            <RecentTransfers transfers={transfers} isLoading={isTransfersLoading} />
          </div>

          {/* Wallet & Tracking Sidebar (Right) */}
          <div className="w-full lg:w-5/12 flex flex-col space-y-8 sticky top-24">
            <LinkedBanks />
            <TransferTracker status={transferStatus} />
          </div>

        </div>
      </div>
    </main>
  );
}
