"use client";

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronDown, CheckCircle, Info, Building2 } from 'lucide-react';
import { TransactionDraft } from '@/lib/db';

interface SendMoneyEngineProps {
    onStatusChange: (status: string) => void;
}

export function SendMoneyEngine({ onStatusChange }: SendMoneyEngineProps) {
    const [draftId, setDraftId] = useState<string | null>(null);
    const [direction, setDirection] = useState<'US_TO_IN' | 'IN_TO_US' | null>(null);
    const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');

    const [linkedBanks, setLinkedBanks] = useState<any[]>([]);
    const [fiatBalance, setFiatBalance] = useState<number>(0);
    const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
    const [otp, setOtp] = useState('');
    const [isPaying, setIsPaying] = useState(false);

    // Amount States
    const [sendAmount, setSendAmount] = useState<string>('1000');

    // Recipient States
    const [recipientName, setRecipientName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [routingOrIfsc, setRoutingOrIfsc] = useState('');

    // Compliance States (IN -> US)
    const [purposeCode, setPurposeCode] = useState('P0104');
    const [lrsChecked, setLrsChecked] = useState(false);

    // Live Rates State
    const [liveRates, setLiveRates] = useState<{ USD_TO_INR: number; INR_TO_USD: number }>({ USD_TO_INR: 83.00, INR_TO_USD: 0.0120 });
    const [isRatesLoading, setIsRatesLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('/api/rates');
                const data = await res.json();
                if (data.success && data.rates) {
                    setLiveRates(data.rates);
                }
            } catch (error) {
                console.error("Failed to fetch rates:", error);
            } finally {
                setIsRatesLoading(false);
            }
        };
        fetchRates();

        // Fetch user banks & balance
        fetch('/api/user/funding').then(res => res.json()).then(data => {
            if (data.success) {
                if (data.fiatBalance !== undefined) setFiatBalance(data.fiatBalance);
                if (data.linkedBanks) setLinkedBanks(data.linkedBanks);
            }
        });
    }, []);

    // Dynamic Constants
    // Dynamic Constants
    const fromCurrency = direction === 'US_TO_IN' ? 'USD' : 'INR';
    const toCurrency = direction === 'US_TO_IN' ? 'INR' : 'USD';
    const exchangeRate = direction === 'US_TO_IN' ? liveRates.USD_TO_INR : (direction === 'IN_TO_US' ? liveRates.INR_TO_USD : 0);
    const serviceFee = direction === 'US_TO_IN' ? 4.99 : (direction === 'IN_TO_US' ? 399.00 : 0); // Flat fee
    const fxMargin = 0.005; // 0.5% margin

    // Calculated fields
    const parsedAmount = parseFloat(sendAmount) || 0;
    const midMarketAmount = parsedAmount * exchangeRate;
    const ourRate = exchangeRate * (1 - fxMargin);
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
            if (data.success && !draftId && direction) {
                setDraftId(data.draft.id);
                // only notify draft status if we are completely in the details step
                if (step === 'details') onStatusChange('draft');
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
        setStep('payment');
    };

    const handleConfirmPayment = async () => {
        if (!selectedBankId) {
            alert("Please select a funding source.");
            return;
        }
        if (otp !== '123456') {
            alert("Invalid OTP. Try 123456.");
            return;
        }

        setIsPaying(true);

        try {
            // Forward the transfer payload to the Node.js production engine
            const res = await fetch('/api/orchestrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    direction,
                    sendAmount: parsedAmount,
                    totalPayAmount: totalYouPay,
                    fundingSource: selectedBankId,
                    fromCountry: direction === 'US_TO_IN' ? 'US' : 'IN',
                    toCountry: direction === 'US_TO_IN' ? 'IN' : 'US'
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setStep('success');
                onStatusChange('initiated');
                // Note: The UI RecentTransfers panel will automatically pick up the real-time Firebase WebSockets 
                // broadcasted back from the Node backend now.
            } else {
                throw new Error(data.error || 'Failed to dispatch via broker');
            }
        } catch (error: any) {
            console.error("Broker connection failed:", error);
            alert("Payment declined: " + error.message);
        } finally {
            setIsPaying(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="bg-white rounded-[20px] shadow-xl border border-slate-100 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-[#0A1128] mb-2">Transfer Initiated!</h2>
                <p className="text-slate-500 mb-6">Your funds are now securely moving through the digital tunnel.</p>
                <button
                    onClick={() => { setStep('details'); setDirection(null); onStatusChange('idle'); }}
                    className="text-blue-600 font-bold hover:underline"
                >
                    Start another transfer
                </button>
            </div>
        );
    }

    if (step === 'payment') {
        return (
            <div className="bg-white rounded-[20px] shadow-xl border border-slate-100 overflow-hidden w-full max-w-2xl mx-auto flex flex-col">
                <div className="bg-[#0A1128] p-5 text-white">
                    <h2 className="text-xl font-bold">Secure Payment</h2>
                    <p className="text-blue-200 text-sm mt-1">Authorize your transfer of {totalYouPay.toFixed(2)} {fromCurrency}</p>
                </div>
                <div className="p-6 space-y-6">
                    <h3 className="font-bold text-slate-800">Select Funding Source</h3>
                    <div className="space-y-3">
                        {/* GlobePay Account Balance (Primary) */}
                        <div
                            onClick={() => setSelectedBankId('globepay-balance')}
                            className={`p-4 border rounded-xl cursor-pointer flex items-center justify-between transition-all ${selectedBankId === 'globepay-balance' ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500' : 'border-slate-200 hover:border-amber-300'}`}
                        >
                            <div className="flex flex-1 items-center">
                                <div className="w-10 h-10 rounded-full bg-[#0A1128] border border-slate-200 flex items-center justify-center text-lg shadow-sm mr-4">
                                    <span className="text-white">GP</span>
                                </div>
                                <div>
                                    <div className="font-bold text-[#0A1128]">GlobePay Account</div>
                                    <div className="text-sm font-semibold flex items-center space-x-2">
                                        <span className={fiatBalance < totalYouPay ? 'text-red-500' : 'text-emerald-600'}>
                                            Available: {fiatBalance.toFixed(2)} USD
                                        </span>
                                        {fiatBalance < totalYouPay && (
                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Insufficient</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {selectedBankId === 'globepay-balance' && <CheckCircle className="text-amber-600 w-5 h-5 shrink-0" />}
                        </div>

                        {/* Linked External Banks */}
                        {linkedBanks.map(bank => (
                            <div
                                key={bank.id}
                                onClick={() => setSelectedBankId(bank.id)}
                                className={`p-4 border rounded-xl cursor-pointer flex items-center justify-between transition-all ${selectedBankId === bank.id ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-lg shadow-sm mr-4">
                                        {bank.bankName === 'HDFC Bank' ? '🏦' : bank.bankName === 'ICICI Bank' ? '🏛️' : '🏦'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#0A1128]">{bank.bankName}</div>
                                        <div className="text-sm text-slate-500 font-mono">•••• {bank.accountNumber?.slice(-4) || 'XXXX'}</div>
                                    </div>
                                </div>
                                {selectedBankId === bank.id && <CheckCircle className="text-blue-600 w-5 h-5" />}
                            </div>
                        ))}
                    </div>

                    {selectedBankId && (
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Enter OTP to Authorize</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono tracking-widest text-center text-lg"
                                placeholder="• • • • • •"
                                maxLength={6}
                            />
                            <p className="text-xs text-slate-500 text-center mt-2">Test OTP: 123456</p>
                        </div>
                    )}

                    <div className="pt-4 flex items-center space-x-3">
                        <button
                            onClick={() => setStep('details')}
                            className="w-1/3 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleConfirmPayment}
                            disabled={!selectedBankId || otp.length < 6 || isPaying || (selectedBankId === 'globepay-balance' && fiatBalance < totalYouPay)}
                            className="flex-1 bg-[#0A1128] hover:bg-[#15234b] text-white py-3 rounded-xl font-bold text-base shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative"
                        >
                            {isPaying ? 'Authorizing...' : `Pay ${totalYouPay.toFixed(2)} ${fromCurrency}`}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[20px] shadow-xl border border-slate-100 overflow-hidden w-full max-w-2xl mx-auto flex flex-col max-h-[85vh]">
            {/* Direction Selector Header */}
            <div className="bg-[#0A1128] p-4 text-white shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold">Transfer Details</h2>
                </div>
                <div className="flex items-center space-x-3">
                    {/* From Dropdown */}
                    <div className="flex-1 relative group cursor-pointer">
                        <select
                            value={direction === 'US_TO_IN' ? 'US' : direction === 'IN_TO_US' ? 'IN' : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'US') setDirection('US_TO_IN');
                                else if (val === 'IN') setDirection('IN_TO_US');
                                else setDirection(null);
                            }}
                            className="w-full p-3.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white outline-none appearance-none font-bold"
                        >
                            <option value="" disabled className="text-black">Select Sender Country</option>
                            <option value="US" className="text-black">🇺🇸 United States (USD)</option>
                            <option value="IN" className="text-black">🇮🇳 India (INR)</option>
                            <option value="UK" disabled className="text-gray-400">🇬🇧 United Kingdom (GBP) - Coming Soon</option>
                            <option value="EU" disabled className="text-gray-400">🇪🇺 Europe (EUR) - Coming Soon</option>
                            <option value="CA" disabled className="text-gray-400">🇨🇦 Canada (CAD) - Coming Soon</option>
                            <option value="AU" disabled className="text-gray-400">🇦🇺 Australia (AUD) - Coming Soon</option>
                            <option value="SG" disabled className="text-gray-400">🇸🇬 Singapore (SGD) - Coming Soon</option>
                        </select>
                        <ChevronDown className="w-5 h-5 absolute right-3 top-4 text-blue-200 pointer-events-none" />
                        <div className="absolute -top-2.5 left-3 bg-[#0A1128] px-1 text-[10px] text-blue-200 font-bold uppercase tracking-wider">From</div>
                    </div>

                    <div className="p-2 bg-white/10 rounded-full shrink-0">
                        <ArrowRight className="w-4 h-4 text-blue-300" />
                    </div>

                    {/* To Dropdown */}
                    <div className="flex-1 relative group cursor-pointer">
                        <select
                            value={direction === 'US_TO_IN' ? 'IN' : direction === 'IN_TO_US' ? 'US' : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'US') setDirection('IN_TO_US');
                                else if (val === 'IN') setDirection('US_TO_IN');
                                else setDirection(null);
                            }}
                            className="w-full p-3.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white outline-none appearance-none font-bold"
                        >
                            <option value="" disabled className="text-black">Select Receiver Country</option>
                            <option value="IN" className="text-black">🇮🇳 India (INR)</option>
                            <option value="US" className="text-black">🇺🇸 United States (USD)</option>
                            <option value="UK" disabled className="text-gray-400">🇬🇧 United Kingdom (GBP) - Coming Soon</option>
                            <option value="EU" disabled className="text-gray-400">🇪🇺 Europe (EUR) - Coming Soon</option>
                            <option value="CA" disabled className="text-gray-400">🇨🇦 Canada (CAD) - Coming Soon</option>
                            <option value="AU" disabled className="text-gray-400">🇦🇺 Australia (AUD) - Coming Soon</option>
                            <option value="SG" disabled className="text-gray-400">🇸🇬 Singapore (SGD) - Coming Soon</option>
                        </select>
                        <ChevronDown className="w-5 h-5 absolute right-3 top-4 text-blue-200 pointer-events-none" />
                        <div className="absolute -top-2.5 left-3 bg-[#0A1128] px-1 text-[10px] text-blue-200 font-bold uppercase tracking-wider">To</div>
                    </div>
                </div>
                {direction === 'IN_TO_US' && (
                    <div className="mt-4 text-xs text-yellow-200 flex items-center bg-yellow-900/30 p-2 rounded-lg">
                        <Info className="w-4 h-4 mr-2" />
                        Outbound transfers require Purpose Code & LRS Declaration.
                    </div>
                )}
            </div>

            {direction === null ? (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] text-slate-500">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                        <span className="text-3xl">🌍</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Where are you sending?</h3>
                    <p className="text-sm">Select a sender and receiver country using the dropdowns above to get real-time rates.</p>
                </div>
            ) : (
                <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
                    {/* Calculator Section */}
                    <div className="space-y-3">
                        {/* You Send */}
                        <div className="flex items-center border border-slate-200 rounded-xl p-3 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                            <div className="flex-1">
                                <div className="text-[11px] font-medium text-slate-500 mb-0.5">You send exactly</div>
                                <input
                                    type="number"
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                    className="w-full bg-transparent text-2xl font-extrabold text-[#0A1128] outline-none"
                                    placeholder="1,000"
                                />
                            </div>
                            <div className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-sm">
                                {direction === 'US_TO_IN' ? '🇺🇸 USD' : '🇮🇳 INR'}
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="pl-5 space-y-2 relative border-l-2 border-slate-100 py-1">
                            <div className="flex justify-between items-center text-[12px]">
                                <div className="flex items-center text-slate-500">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-2 font-bold text-[10px]">-</span>
                                    Service Fee
                                </div>
                                <span className="font-semibold text-slate-700">{serviceFee.toFixed(2)} {fromCurrency}</span>
                            </div>

                            {taxAmount > 0 && (
                                <div className="flex justify-between items-center text-[12px]">
                                    <div className="flex items-center text-slate-500">
                                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-2 font-bold text-[10px]">-</span>
                                        {direction === 'IN_TO_US' ? (isTcsApplicable ? 'TCS (20%)' : 'GST (5%)') : 'Tax'}
                                    </div>
                                    <span className="font-semibold text-slate-700">{taxAmount.toFixed(2)} {fromCurrency}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-[12px]">
                                <div className="flex items-center text-slate-500">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-2 font-bold text-[10px]">=</span>
                                    Amount we'll convert
                                </div>
                                <span className="font-semibold text-slate-700">{parsedAmount.toFixed(2)} {fromCurrency}</span>
                            </div>

                            <div className="flex justify-between items-center text-[12px] group cursor-pointer">
                                <div className="flex items-center text-green-600 font-medium">
                                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 font-bold text-[10px]">×</span>
                                    Guaranteed Rate {isRatesLoading ? '(Loading...)' : ''}
                                </div>
                                <span className="font-bold text-green-600">{ourRate.toFixed(4)}</span>
                            </div>

                            <div className="text-[9px] text-slate-400 pl-7">
                                Live mid-market rate: {exchangeRate.toFixed(4)} (Our profit: {fxProfit.toFixed(2)} {toCurrency})
                            </div>
                        </div>

                        {/* Recipient Gets */}
                        <div className="flex items-center border border-slate-200 rounded-xl p-3 bg-slate-50">
                            <div className="flex-1">
                                <div className="text-[11px] font-medium text-slate-500 mb-0.5">Recipient gets</div>
                                <div className="text-2xl font-extrabold text-[#0A1128]">
                                    {recipientGets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-sm">
                                {direction === 'US_TO_IN' ? '🇮🇳 INR' : '🇺🇸 USD'}
                            </div>
                        </div>
                    </div>

                    {/* Recipient Details Form */}
                    <div className="border-t border-slate-100 pt-5 shrink-0">
                        <h3 className="font-bold text-[#0A1128] text-sm mb-3 flex items-center">
                            <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                            Recipient Bank Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    placeholder="Full legal name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Account Number</label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="w-full p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
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
                                        className="w-full p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono uppercase"
                                        placeholder={direction === 'US_TO_IN' ? 'HDFC0001234' : '021000021'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Fields (India Outbound Only) */}
                    {direction === 'IN_TO_US' && (
                        <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-4 mb-4 shrink-0">
                            <h4 className="font-bold text-yellow-900 mb-2 text-sm">Regulatory Requirements (RBI)</h4>

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
                    <div className="pt-3 border-t border-slate-100 shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-sm font-bold text-slate-600">Total You Pay</div>
                            <div className="text-xl font-black text-[#0A1128]">
                                {totalYouPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-slate-500 font-semibold">{fromCurrency}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full bg-[#0A1128] hover:bg-[#15234b] text-white py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                            Continue to Payment
                        </button>
                        <p className="text-center text-[10px] text-slate-400 mt-3">
                            By continuing, you agree to our terms of service and exchange rate policy.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
