"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { convertFiatToMockUSDC, buildTransferTransaction } from '@/lib/web3/utils';
import { Loader2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

// For the prototype, we use a fixed mock USDC Devnet mint address
const MOCK_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export function SendMoney() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [fiatAmount, setFiatAmount] = useState<string>('');
    const [recipient, setRecipient] = useState<string>('');

    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'converting' | 'transferring' | 'success' | 'error'>('idle');
    const [txSignature, setTxSignature] = useState<string | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey) {
            alert("Please connect your wallet first.");
            return;
        }

        if (!fiatAmount || isNaN(Number(fiatAmount)) || Number(fiatAmount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        try {
            setIsProcessing(true);
            setStatus('converting');

            // 1. Simulate Fiat to Crypto On-ramp
            const usdcAmount = await convertFiatToMockUSDC(Number(fiatAmount));

            setStatus('transferring');

            // 2. Build Transaction
            const transaction = await buildTransferTransaction(
                connection,
                publicKey,
                recipient,
                usdcAmount,
                MOCK_USDC_MINT
            );

            if (!transaction) throw new Error("Failed to build transaction");

            // 3. Send Transaction via Solana network
            const signature = await sendTransaction(transaction, connection);
            console.log('Transaction sent:', signature);
            setTxSignature(signature);

            // Await confirmation
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            }, 'confirmed');

            setStatus('success');
        } catch (error: any) {
            console.error("Transfer failed:", error);
            setStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Send Money</h2>

            {status === 'success' ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800">Transfer Successful</h3>
                    <p className="text-sm text-slate-500 mt-2 mb-6">Your money is on its way to the recipient.</p>
                    <button
                        onClick={() => {
                            setStatus('idle');
                            setFiatAmount('');
                            setRecipient('');
                            setTxSignature(null);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                    >
                        Send Another
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">You send (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                            <input
                                type="number"
                                disabled={isProcessing}
                                value={fiatAmount}
                                onChange={(e) => setFiatAmount(e.target.value)}
                                placeholder="100.00"
                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center py-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Recipient Solana Address</label>
                        <input
                            type="text"
                            disabled={isProcessing}
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="Solana address..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Transfer failed. Please check network fees balancing or try again.</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isProcessing || !publicKey || !fiatAmount || !recipient}
                        className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium transition"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>
                                    {status === 'converting' ? 'Converting via On-ramp...' : 'Processing Transfer...'}
                                </span>
                            </>
                        ) : (
                            <span>Continue</span>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
