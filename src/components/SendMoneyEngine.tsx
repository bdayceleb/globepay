"use client";

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronDown, CheckCircle, Info, Building2 } from 'lucide-react';
import { TransactionDraft } from '@/lib/db';

interface SendMoneyEngineProps {
    onStatusChange: (status: string) => void;
}

export function SendMoneyEngine({ onStatusChange }: SendMoneyEngineProps) {
    const [draftId, setDraftId] = useState<string | null>(null);
    const [direction, setDirection] = useState<'US_TO_IN' | 'IN_TO_US'>('US_TO_IN');

    // Amount States
    const [sendAmount, setSendAmount] = useState<string>('1000');

    // Recipient States
    const [recipientName, setRecipientName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [routingOrIfsc, setRoutingOrIfsc] = useState('');

    // Compliance States (IN -> US)
    const [purposeCode, setPurposeCode] = useState('P0104');
    const [lrsChecked, setLrsChecked] = useState(false);

    // Dynamic Constants
    const fromCurrency = direction === 'US_TO_IN' ? 'USD' : 'INR';
    const toCurrency = direction === 'US_TO_IN' ? 'INR' : 'USD';
    const exchangeRate = direction === 'US_TO_IN' ? 82.50 : 0.012; // Mock rates
    const serviceFee = direction === 'US_TO_IN' ? 4.99 : 399.00; // Flat fee
    const fxMargin = 0.005; // 0.5% margin

    // Calculated fields
    const parsedAmount = parseFloat(sendAmount) || 0;
    const midMarketAmount = parsedAmount * exchangeRate;
    const ourRate = direction === 'US_TO_IN' ? exchangeRate * (1 - fxMargin) : exchangeRate * (1 - fxMargin);
    const fxProfit = Math.abs(midMarketAmount - (parsedAmount * ourRate));

    const isTcsApplicable = direction === 'IN_TO_US' && parsedAmount > 700000;
    const taxAmount = direction === 'IN_TO_US' ? (isTcsApplicable ? parsedAmount * 0.20 : parsedAmount * 0.05) : 0; // Simplified TCS/GST

    const totalYouPay = parsedAmount + serviceFee + taxAmount;
    const recipientGets = parsedAmount * ourRate;

    // Auto-save debouncer
    useEffect(() => {
        const handler = setTimeout(() => {
            saveDraft();
        }, 1000); // 1s debounce
        return () => clearTimeout(handler);
    }, [direction, sendAmount, recipientName, accountNumber, routingOrIfsc, purposeCode, lrsChecked]);

    const saveDraft = async () => {
        if (!parsedAmount) return;

        const draft: Partial<TransactionDraft> = {
            ...(draftId && { id: draftId }),
            fromCountry: direction === 'US_TO_IN' ? 'US' : 'IN',
            toCountry: direction === 'US_TO_IN' ? 'IN' : 'US',
            sendCurrency: fromCurrency,
            receiveCurrency: toCurrency,
            sendAmount: parsedAmount,
            exchangeRate: ourRate,
            fxSpread: fxProfit,
            serviceFee: serviceFee,
            taxAmount: taxAmount,
            estimatedPayout: recipientGets,
            status: 'draft',
            recipientDetails: {
                name: recipientName,
                accountNumber: accountNumber,
                ifscCode: direction === 'US_TO_IN' ? routingOrIfsc : undefined,
                routingNumber: direction === 'IN_TO_US' ? routingOrIfsc : undefined
            },
            ...(direction === 'IN_TO_US' && {
                complianceFields: {
                    purposeCode,
                    lrsDeclaration: lrsChecked
                }
            })
        };

        try {
            const res = await fetch('/api/transactions/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draft)
            });
            const data = await res.json();
            if (data.success && !draftId) {
                setDraftId(data.draft.id);
                onStatusChange('draft');
            }
        } catch (error) {
            console.error('Failed to save draft:', error);
        }
    };

    const handleContinue = () => {
        if (direction === 'IN_TO_US' && !lrsChecked) {
            alert("You must agree to the LRS deceleration.");
            return;
        }
        if (!recipientName || !accountNumber || !routingOrIfsc) {
            alert("Please fill in all recipient details.");
            return;
        }
        onStatusChange('initiated');
    };

    return (
        <div className="bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden w-full max-w-2xl mx-auto">
            {/* Direction Selector Header */}
            <div className="bg-[#0A1128] p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold">Transfer Details</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <div
                        onClick={() => setDirection('US_TO_IN')}
                        className={`cursor-pointer flex-1 p-4 rounded-xl border transition-all ${direction === 'US_TO_IN' ? 'bg-white/10 border-blue-400' : 'border-white/20 hover:bg-white/5'}`}
                    >
                        <div className="text-xs text-blue-200 mb-1">From</div>
                        <div className="flex items-center space-x-2 font-bold">
                            <span className="text-2xl">🇺🇸</span>
                            <span>United States (USD)</span>
                        </div>
                    </div>

                    <div className="p-2 bg-white/10 rounded-full shrink-0">
                        <ArrowRight className="w-5 h-5 text-blue-300" />
                    </div>

                    <div
                        onClick={() => setDirection('IN_TO_US')}
                        className={`cursor-pointer flex-1 p-4 rounded-xl border transition-all ${direction === 'IN_TO_US' ? 'bg-white/10 border-blue-400' : 'border-white/20 hover:bg-white/5'}`}
                    >
                        <div className="text-xs text-blue-200 mb-1">To</div>
                        <div className="flex items-center space-x-2 font-bold">
                            <span className="text-2xl">🇮🇳</span>
                            <span>India (INR)</span>
                        </div>
                    </div>
                </div>
                {direction === 'IN_TO_US' && (
                    <div className="mt-4 text-xs text-yellow-200 flex items-center bg-yellow-900/30 p-2 rounded-lg">
                        <Info className="w-4 h-4 mr-2" />
                        Outbound transfers require Purpose Code & LRS Declaration.
                    </div>
                )}
            </div>

            <div className="p-6 sm:p-8 space-y-8">
                {/* Calculator Section */}
                <div className="space-y-4">
                    {/* You Send */}
                    <div className="flex items-center border border-slate-200 rounded-xl p-4 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                        <div className="flex-1">
                            <div className="text-sm font-medium text-slate-500 mb-1">You send exactly</div>
                            <input
                                type="number"
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                                className="w-full bg-transparent text-3xl font-extrabold text-[#0A1128] outline-none"
                                placeholder="1,000"
                            />
                        </div>
                        <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold">
                            {direction === 'US_TO_IN' ? '🇺🇸 USD' : '🇮🇳 INR'}
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="pl-6 space-y-3 relative border-l-2 border-slate-100 py-2">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center text-slate-500">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-3 font-bold text-xs">-</span>
                                Service Fee
                            </div>
                            <span className="font-semibold text-slate-700">{serviceFee.toFixed(2)} {fromCurrency}</span>
                        </div>

                        {taxAmount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center text-slate-500">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-3 font-bold text-xs">-</span>
                                    {direction === 'IN_TO_US' ? (isTcsApplicable ? 'TCS (20%)' : 'GST (5%)') : 'Tax'}
                                </div>
                                <span className="font-semibold text-slate-700">{taxAmount.toFixed(2)} {fromCurrency}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center text-slate-500">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-3 font-bold text-xs">=</span>
                                Amount we'll convert
                            </div>
                            <span className="font-semibold text-slate-700">{parsedAmount.toFixed(2)} {fromCurrency}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm group cursor-pointer">
                            <div className="flex items-center text-green-600 font-medium">
                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 font-bold text-xs">×</span>
                                Guaranteed Rate (Includes FX Spread)
                            </div>
                            <span className="font-bold text-green-600">{ourRate.toFixed(4)}</span>
                        </div>

                        <div className="text-[10px] text-slate-400 pl-9">
                            Mid-market rate: {exchangeRate.toFixed(4)} (Our profit: {fxProfit.toFixed(2)} {toCurrency})
                        </div>
                    </div>

                    {/* Recipient Gets */}
                    <div className="flex items-center border border-slate-200 rounded-xl p-4 bg-slate-50">
                        <div className="flex-1">
                            <div className="text-sm font-medium text-slate-500 mb-1">Recipient gets</div>
                            <div className="text-3xl font-extrabold text-[#0A1128]">
                                {recipientGets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold">
                            {direction === 'US_TO_IN' ? '🇮🇳 INR' : '🇺🇸 USD'}
                        </div>
                    </div>
                </div>

                {/* Recipient Details Form */}
                <div className="border-t border-slate-100 pt-8">
                    <h3 className="font-bold text-[#0A1128] mb-4 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-slate-400" />
                        Recipient Bank Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Account Holder Name</label>
                            <input
                                type="text"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                placeholder="Full legal name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Account Number</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                                    placeholder="Number"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                                    {direction === 'US_TO_IN' ? 'IFSC Code' : 'Routing Number'}
                                </label>
                                <input
                                    type="text"
                                    value={routingOrIfsc}
                                    onChange={(e) => setRoutingOrIfsc(e.target.value.toUpperCase())}
                                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono uppercase"
                                    placeholder={direction === 'US_TO_IN' ? 'HDFC0001234' : '021000021'}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance Fields (India Outbound Only) */}
                {direction === 'IN_TO_US' && (
                    <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-5 mb-6">
                        <h4 className="font-bold text-yellow-900 mb-3 text-sm">Regulatory Requirements (RBI)</h4>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-yellow-800 mb-1">Purpose Code</label>
                            <select
                                value={purposeCode}
                                onChange={(e) => setPurposeCode(e.target.value)}
                                className="w-full p-2.5 bg-white border border-yellow-300 rounded-lg text-sm outline-none focus:border-yellow-500"
                            >
                                <option value="P0104">P0104 - Maintenance of close relatives</option>
                                <option value="P1301">P1301 - Operating expenses of Indian branches</option>
                                <option value="P0301">P0301 - Travel for business</option>
                                <option value="P1107">P1107 - Education abroad</option>
                            </select>
                        </div>

                        <label className="flex items-start space-x-3 cursor-pointer group">
                            <div className="pt-0.5">
                                <input
                                    type="checkbox"
                                    checked={lrsChecked}
                                    onChange={(e) => setLrsChecked(e.target.checked)}
                                    className="w-4 h-4 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                                />
                            </div>
                            <span className="text-xs text-yellow-800 leading-relaxed font-medium">
                                I declare under the Liberalised Remittance Scheme (LRS) that my total remittances this financial year do not exceed $250,000 USD. My PAN and Aadhaar used during signup remain valid for this assessment.
                            </span>
                        </label>
                    </div>
                )}

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm font-bold text-slate-600">Total You Pay</div>
                        <div className="text-2xl font-black text-[#0A1128]">
                            {totalYouPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-base text-slate-500 font-semibold">{fromCurrency}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleContinue}
                        className="w-full bg-[#0A1128] hover:bg-[#15234b] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        Continue to Payment
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        By continuing, you agree to our terms of service and exchange rate policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
