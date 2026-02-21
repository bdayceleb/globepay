"use client";

import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, CheckCircle, AlertCircle, ExternalLink, ShieldCheck, Banknote } from 'lucide-react';

export function SendMoney() {
    const [fiatAmount, setFiatAmount] = useState<string>('');
    const [recipient, setRecipient] = useState<string>('');

    const [isProcessing, setIsProcessing] = useState(false);
    // 4 stages for the demo
    const [status, setStatus] = useState<'idle' | 'onramp' | 'transit' | 'offramp' | 'success' | 'error'>('idle');
    const [txSignature, setTxSignature] = useState<string | null>(null);
    const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
    const [bankReference, setBankReference] = useState<string | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fiatAmount || isNaN(Number(fiatAmount)) || Number(fiatAmount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        try {
            setIsProcessing(true);

            // Step 1: Fiat On-ramp & Solana Transit
            setStatus('onramp');
            await new Promise(r => setTimeout(r, 1500)); // Artificial UX delay

            setStatus('transit');
            const onrampRes = await fetch('/api/tunnel/onramp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(fiatAmount),
                    currency: 'USD',
                    destinationAddress: recipient || '11111111111111111111111111111111' // Fallback to System Program 
                })
            });
            const onrampData = await onrampRes.json();

            if (!onrampData.success) throw new Error("Onramp failed");

            setTxSignature(onrampData.solanaSignature);
            setExplorerUrl(onrampData.explorerUrl);

            // Step 2: Fiat Off-ramp
            setStatus('offramp');
            const offrampRes = await fetch('/api/tunnel/offramp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(fiatAmount) * 83.5, // Mock INR rate
                    targetCurrency: 'INR',
                    solanaSignature: onrampData.solanaSignature,
                    recipientId: recipient
                })
            });
            const offrampData = await offrampRes.json();

            if (!offrampData.success) throw new Error("Offramp failed");

            setBankReference(offrampData.localBankReference);

            setStatus('success');
        } catch (error: any) {
            console.error("Transfer failed:", error);
            setStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-xl border border-slate-100 max-w-md w-full relative z-20">
            <h2 className="text-2xl font-bold text-[#0A1128] mb-6">Send Money</h2>

            {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1128]">Transfer Complete</h3>
                    <p className="text-gray-500 mt-2 mb-6">Funds have arrived in the recipient's bank account via TransFi API.</p>

                    <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 space-y-3 text-left">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Local Bank Ref:</span>
                            <span className="font-mono font-medium text-slate-800">{bankReference}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Blockchain Receipt:</span>
                            {explorerUrl && (
                                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#00B9FF] hover:underline font-medium">
                                    View on Solana <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setStatus('idle');
                            setFiatAmount('');
                            setRecipient('');
                            setTxSignature(null);
                            setExplorerUrl(null);
                            setBankReference(null);
                        }}
                        className="w-full py-3 bg-[#0A1128] hover:bg-[#15234b] text-white rounded-full font-bold transition"
                    >
                        Send Another
                    </button>
                </div>
            ) : isProcessing ? (
                <div className="py-8">
                    <div className="space-y-8">
                        {/* Step 1: On-Ramp */}
                        <div className={`flex items-start transition-opacity duration-300 ${status === 'onramp' ? 'opacity-100' : 'opacity-40'}`}>
                            <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                {status === 'onramp' ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> : <Banknote className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-slate-800">1. Fiat Entry (Bridge API)</h4>
                                <p className="text-sm text-slate-500">Detecting bank deposit & minting virtual USDC...</p>
                            </div>
                        </div>

                        {/* Step 2: Transit */}
                        <div className={`flex items-start transition-opacity duration-300 ${status === 'transit' ? 'opacity-100' : (status === 'offramp' ? 'opacity-40' : 'opacity-20')}`}>
                            <div className="mt-1 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                {status === 'transit' ? <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-indigo-600" />}
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-slate-800">2. Solana Engine Transit</h4>
                                <p className="text-sm text-slate-500">Executing Gasless Transfer on Devnet...</p>
                                {txSignature && (
                                    <div className="mt-2 text-xs font-mono text-slate-400 truncate max-w-[200px]">
                                        Sig: {txSignature}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Off-Ramp */}
                        <div className={`flex items-start transition-opacity duration-300 ${status === 'offramp' ? 'opacity-100' : 'opacity-20'}`}>
                            <div className="mt-1 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-slate-800">3. Fiat Exit (TransFi API)</h4>
                                <p className="text-sm text-slate-500">Converting USDC to target fiat & triggering local rails...</p>
                            </div>
                        </div>
                    </div>
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
                        disabled={!fiatAmount || !recipient}
                        className="w-full mt-6 flex items-center justify-center space-x-2 bg-[#DDF51A] hover:bg-[#c5dc17] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A1128] py-4 rounded-full font-bold text-lg transition"
                    >
                        <span>Start Transfer</span>
                    </button>
                </form>
            )}
        </div>
    );
}
