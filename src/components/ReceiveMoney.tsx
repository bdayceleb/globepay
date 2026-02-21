"use client";

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { convertMockUSDCToFiat } from '@/lib/web3/utils';
import { Banknote, Loader2, ArrowRight } from 'lucide-react';

const MOCK_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export function ReceiveMoney() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const [usdcBalance, setUsdcBalance] = useState<number>(0);
    const [fiatBalance, setFiatBalance] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [withdrawn, setWithdrawn] = useState(false);

    useEffect(() => {
        async function fetchBalance() {
            if (!publicKey) return;
            try {
                const usdcMint = new PublicKey(MOCK_USDC_MINT);
                const ata = await getAssociatedTokenAddress(usdcMint, publicKey);
                const account = await getAccount(connection, ata);
                // Assuming 6 decimals
                const balance = Number(account.amount) / Math.pow(10, 6);
                setUsdcBalance(balance);
                const fiat = await convertMockUSDCToFiat(balance);
                setFiatBalance(fiat);
            } catch (err) {
                console.log("No USDC account found or error fetching balance:", err);
                setUsdcBalance(0);
                setFiatBalance(0);
            }
        }

        fetchBalance();

        // Refresh every 10 seconds for prototype
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [publicKey, connection]);

    const handleWithdraw = async () => {
        setIsProcessing(true);
        // Simulate exactly off-ramping
        await convertMockUSDCToFiat(usdcBalance);
        setIsProcessing(false);
        setWithdrawn(true);
    };

    if (!publicKey) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center">
                <p className="text-slate-500">Connect wallet to see your balance.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Banknote className="w-5 h-5 mr-2 text-emerald-600" />
                Your Funds
            </h2>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center justify-center mb-6">
                <p className="text-sm font-medium text-slate-500 mb-1">Available Balance</p>
                <h3 className="text-3xl font-bold text-slate-800">
                    {usdcBalance.toFixed(2)} <span className="text-lg text-slate-500">USDC</span>
                </h3>
                <p className="text-sm text-slate-400 mt-2">≈ €{fiatBalance.toFixed(2)} EUR</p>
            </div>

            {withdrawn ? (
                <div className="text-center p-4 bg-emerald-50 text-emerald-700 rounded-xl">
                    <p className="font-medium">Withdrawal initiated</p>
                    <p className="text-sm mt-1">Funds will arrive in your bank account shortly.</p>
                </div>
            ) : (
                <button
                    onClick={handleWithdraw}
                    disabled={isProcessing || usdcBalance === 0}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium transition"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Withdrawing to Bank...</span>
                        </>
                    ) : (
                        <>
                            <span>Withdraw to Bank (EUR)</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
