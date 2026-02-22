"use client";

import { useState, useEffect } from 'react';
import { Building2, Plus, PlusCircle, Trash2, Wallet, ArrowDown, Eye, CheckCircle } from 'lucide-react';

interface BankAccount {
    id: string;
    bankName: string;
    icon: string;
    accountNumber: string;
    ifscCode: string;
    isDefault: boolean;
    balanceVisible: boolean;
    mockBalance: number;
}

export function LinkedBanks() {
    const [balance, setBalance] = useState<number>(0);
    const [banks, setBanks] = useState<BankAccount[]>([
        { id: '1', bankName: 'HDFC Bank', icon: '🏦', accountNumber: '000000123456789', ifscCode: 'HDFC0001234', isDefault: true, balanceVisible: false, mockBalance: 82500 },
    ]);

    // Form States
    const [countryCode, setCountryCode] = useState<string>('+91');
    const [isAddingBank, setIsAddingBank] = useState(false);
    const [addStep, setAddStep] = useState<1 | 2>(1); // 1: Details, 2: OTP
    const [newBankName, setNewBankName] = useState('State Bank of India (SBI)');
    const [newAccNum, setNewAccNum] = useState('');
    const [confirmAccNum, setConfirmAccNum] = useState('');
    const [newIfsc, setNewIfsc] = useState('');
    const [otp, setOtp] = useState('');
    const [linkError, setLinkError] = useState('');
    const [isLinking, setIsLinking] = useState(false);

    const [isAddingMoney, setIsAddingMoney] = useState(false);
    const [addAmount, setAddAmount] = useState('');

    const [isFundingLoading, setIsFundingLoading] = useState(true);

    // Fetch User Funding Data on Mount
    useEffect(() => {
        const fetchFundingData = async () => {
            try {
                const res = await fetch('/api/user/funding');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setBalance(data.fiatBalance || 0);
                        setCountryCode(data.countryCode || '+91');
                        // Ensure legacy banks without mockBalance get one
                        const mappedBanks = (data.linkedBanks || []).map((b: any) => ({
                            ...b,
                            balanceVisible: false,
                            mockBalance: b.mockBalance || Math.floor(800000 + Math.random() * 1200000)
                        }));
                        setBanks(mappedBanks);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch funding data", error);
            } finally {
                setIsFundingLoading(false);
            }
        };
        fetchFundingData();
    }, []);

    const IND_BANKS = [
        { name: 'State Bank of India (SBI)', icon: '🏛️' },
        { name: 'HDFC Bank', icon: '🏦' },
        { name: 'ICICI Bank', icon: '🏢' },
        { name: 'Axis Bank', icon: '🏧' },
        { name: 'Kotak Mahindra Bank', icon: '🏦' },
        { name: 'Punjab National Bank', icon: '🏛️' }
    ];

    const US_BANKS = [
        { name: 'JPMorgan Chase', icon: '🏛️' },
        { name: 'Bank of America', icon: '🏦' },
        { name: 'Wells Fargo', icon: '🏧' },
        { name: 'Citibank', icon: '🏢' },
        { name: 'U.S. Bank', icon: '🏦' }
    ];

    const GLOBAL_BANKS = [
        { name: 'HSBC', icon: '🏦' },
        { name: 'Barclays', icon: '🏛️' },
        { name: 'Standard Chartered', icon: '🏢' }
    ];

    const AVAILABLE_BANKS = countryCode === '+91' ? IND_BANKS : countryCode === '+1' ? US_BANKS : GLOBAL_BANKS;

    const startAddBank = () => {
        setIsAddingBank(true);
        setAddStep(1);
        setNewBankName(AVAILABLE_BANKS[0].name);
        setNewAccNum('');
        setConfirmAccNum('');
        setNewIfsc('');
        setOtp('');
        setLinkError('');
    };

    const handleSendBankOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setLinkError('');
        if (newAccNum !== confirmAccNum) {
            setLinkError("Account numbers do not match.");
            return;
        }
        if (newAccNum.length < 5) {
            setLinkError("Invalid Account Number.");
            return;
        }
        if (countryCode === '+91' && newIfsc.length !== 11) {
            setLinkError("Invalid IFSC Code. Must be 11 characters.");
            return;
        }
        if (countryCode === '+1' && newIfsc.length !== 9) {
            setLinkError("Invalid Routing Number. Must be exactly 9 digits.");
            return;
        }
        setAddStep(2);
    };

    const handleVerifyBankOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setLinkError('');
        if (otp !== '123456') {
            setLinkError("Invalid OTP. Use '123456' for demo.");
            return;
        }

        setIsLinking(true);
        setTimeout(async () => {
            const selectedBank = AVAILABLE_BANKS.find(b => b.name === newBankName);
            const newBank = {
                id: Date.now().toString(),
                bankName: newBankName,
                icon: selectedBank?.icon || '🏦',
                accountNumber: newAccNum,
                ifscCode: newIfsc,
                isDefault: banks.length === 0,
                balanceVisible: false,
                mockBalance: Math.floor(800000 + Math.random() * 1200000) // between 8 Lakhs and 20 Lakhs
            };

            // PERSIST TO DATABASE
            try {
                const res = await fetch('/api/user/funding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'ADD_BANK', payload: newBank })
                });

                if (res.ok) {
                    setBanks([...banks, newBank]);
                    setIsAddingBank(false);
                } else {
                    setLinkError("Failed to link bank to database.");
                }
            } catch (e) {
                setLinkError("Network error.");
            } finally {
                setIsLinking(false);
            }
        }, 1000);
    };

    const handleRemoveBank = async (id: string) => {
        // Optimistic UI Update
        const previousBanks = [...banks];
        setBanks(banks.filter(b => b.id !== id));

        try {
            const res = await fetch('/api/user/funding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'REMOVE_BANK', payload: { id } })
            });
            if (!res.ok) {
                setBanks(previousBanks); // Revert on failure
                alert("Failed to remove bank");
            }
        } catch (e) {
            setBanks(previousBanks);
            alert("Network error. Could not remove bank.");
        }
    };

    const toggleBalance = (id: string) => {
        setBanks(banks.map(b => b.id === id ? { ...b, balanceVisible: !b.balanceVisible } : b));
    };

    const handleAddMoney = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) return;

        setIsAddingMoney(true);
        // Simulate an ACH/UPI pull from the default bank and persist to DB
        setTimeout(async () => {
            try {
                const res = await fetch('/api/user/funding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'ADD_FUNDS', payload: { amount: Number(addAmount) } })
                });

                if (res.ok) {
                    setBalance(prev => prev + Number(addAmount));
                    setAddAmount('');
                } else {
                    alert("Failed to add funds.");
                }
            } catch (error) {
                alert("Network error.");
            } finally {
                setIsAddingMoney(false);
            }
        }, 1200);
    };

    return (
        <div className="space-y-8 relative z-20">
            {/* Card 1: GlobePay Balance */}
            <div className="relative bg-white/90 backdrop-blur-2xl p-6 sm:p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 w-full hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden">
                <div className="mb-6 relative z-10">
                    <div className="flex items-center text-slate-500 font-semibold mb-2 tracking-widest text-[10px] text-xs uppercase">
                        <Wallet className="w-4 h-4 mr-2 text-blue-500" />
                        GlobePay Account Balance
                    </div>
                    <div className="text-[40px] font-black text-[#0A1128] tracking-tight leading-none">
                        {countryCode === '+91' ? '₹' : countryCode === '+1' ? '$' : '£'}{balance.toFixed(2)} <span className="text-xl text-slate-400 font-bold ml-1">{countryCode === '+91' ? 'INR' : countryCode === '+1' ? 'USD' : 'GBP'}</span>
                    </div>
                </div>

                {/* Add Money Form */}
                <form onSubmit={handleAddMoney} className="p-4 bg-slate-50 rounded-[16px] border border-slate-200">
                    <label className="block text-sm font-bold text-[#0A1128] mb-2">Fund your account</label>
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                {countryCode === '+91' ? '₹' : countryCode === '+1' ? '$' : '£'}
                            </span>
                            <input
                                type="number"
                                value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)}
                                placeholder="Amount"
                                disabled={isAddingMoney || banks.length === 0}
                                className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-semibold"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAddingMoney || banks.length === 0 || !addAmount}
                            className="bg-[#0A1128] hover:bg-[#15234b] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold flex items-center transition shadow-md"
                        >
                            {isAddingMoney ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <ArrowDown className="w-4 h-4 mr-1.5" />
                                    Add
                                </>
                            )}
                        </button>
                    </div>
                    {banks.length === 0 && (
                        <p className="text-xs text-red-500 mt-2 font-medium">Link a bank account first to add funds.</p>
                    )}
                </form>
            </div>

            {/* Card 2: Linked Banks Section */}
            <div className="relative bg-white/90 backdrop-blur-2xl p-6 sm:p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 w-full hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden">
                <div className="flex justify-between items-center mb-5 relative z-10">
                    <h3 className="font-bold text-[#0A1128]">Linked Bank Accounts</h3>
                    {!isAddingBank && (
                        <button
                            onClick={startAddBank}
                            className="text-sm font-bold text-[#00B9FF] hover:text-blue-700 flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Link Bank
                        </button>
                    )}
                </div>

                {isAddingBank ? (
                    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm mb-4">
                        <h4 className="font-bold text-sm mb-4 text-[#0A1128]">Link New Bank Account</h4>
                        {linkError && <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded">{linkError}</p>}

                        {addStep === 1 ? (
                            <form onSubmit={handleSendBankOtp} className="space-y-3">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Select Bank</label>
                                    <select
                                        value={newBankName}
                                        onChange={(e) => setNewBankName(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                                    >
                                        {AVAILABLE_BANKS.map(b => <option key={b.name} value={b.name}>{b.icon} {b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Account Number</label>
                                    <input
                                        type="password"
                                        required
                                        value={newAccNum}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, ''); // Only allow digits
                                            if (val.length <= 20) setNewAccNum(val);
                                        }}
                                        maxLength={20}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
                                        placeholder="Enter account number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Confirm Account Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={confirmAccNum}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 20) setConfirmAccNum(val);
                                        }}
                                        maxLength={20}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
                                        placeholder="Re-enter account number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">
                                        {countryCode === '+91' ? 'IFSC Code' : countryCode === '+1' ? 'Routing Number' : 'SWIFT/BIC Code'}
                                    </label>
                                    <input type="text" required value={newIfsc} onChange={e => setNewIfsc(e.target.value.toUpperCase())} maxLength={11} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 uppercase" placeholder={countryCode === '+91' ? "e.g. SBIN0001234" : countryCode === '+1' ? "9 Digit Routing Number" : "SWIFT/BIC Code"} />
                                </div>
                                <div className="flex space-x-2 pt-2">
                                    <button type="button" onClick={() => setIsAddingBank(false)} className="flex-1 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Verify</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyBankOtp} className="space-y-4">
                                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs">
                                    An OTP has been sent to the mobile number registered with {newBankName}. (Demo: 123456)
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Enter Bank OTP</label>
                                    <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} className="w-full p-3 border border-slate-300 rounded-lg text-center tracking-widest font-mono text-lg outline-none focus:border-blue-500" placeholder="------" />
                                </div>
                                <div className="flex space-x-2">
                                    <button type="button" onClick={() => setAddStep(1)} className="flex-1 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Back</button>
                                    <button type="submit" disabled={isLinking || otp.length < 6} className="flex-1 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold flex items-center justify-center disabled:opacity-50">
                                        {isLinking ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Link Account'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {banks.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
                                No bank accounts linked yet.<br />
                                Link an account to fund your wallet.
                            </div>
                        ) : (
                            banks.map(bank => (
                                <div key={bank.id} className="p-4 border border-slate-200/60 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all bg-white shadow-sm relative group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-xl">
                                                {bank.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#0A1128] text-sm">{bank.bankName}</div>
                                                <div className="text-xs text-slate-500">A/c no. ends in {bank.accountNumber.slice(-4)}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBank(bank.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Delink Bank Account"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <div className="text-sm font-semibold text-[#0A1128]">
                                            {bank.balanceVisible ? `${countryCode === '+91' ? '₹' : countryCode === '+1' ? '$' : '£'} ${bank.mockBalance.toLocaleString(countryCode === '+1' ? 'en-US' : 'en-IN')}` : `${countryCode === '+91' ? '₹' : countryCode === '+1' ? '$' : '£'} ••••••`}
                                        </div>
                                        <button
                                            onClick={() => toggleBalance(bank.id)}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            {bank.balanceVisible ? 'Hide Balance' : <>Check Balance</>}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
