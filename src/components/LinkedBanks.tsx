"use client";

import { useState } from 'react';
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

    const IND_BANKS = [
        { name: 'State Bank of India (SBI)', icon: '🏛️' },
        { name: 'HDFC Bank', icon: '🏦' },
        { name: 'ICICI Bank', icon: '🏢' },
        { name: 'Axis Bank', icon: '🏧' },
        { name: 'Kotak Mahindra Bank', icon: '🏦' },
        { name: 'Punjab National Bank', icon: '🏛️' }
    ];

    const startAddBank = () => {
        setIsAddingBank(true);
        setAddStep(1);
        setNewBankName(IND_BANKS[0].name);
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
        if (!/^\d{15}$/.test(newAccNum)) {
            setLinkError("Invalid Account Number. Must be exactly 15 digits.");
            return;
        }
        if (newIfsc.length !== 11) {
            setLinkError("Invalid IFSC Code. Must be 11 characters.");
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
        setTimeout(() => {
            const selectedBank = IND_BANKS.find(b => b.name === newBankName);
            const newBank: BankAccount = {
                id: Date.now().toString(),
                bankName: newBankName,
                icon: selectedBank?.icon || '🏦',
                accountNumber: newAccNum,
                ifscCode: newIfsc,
                isDefault: banks.length === 0,
                balanceVisible: false,
                mockBalance: Math.floor(10000 + Math.random() * 90000)
            };
            setBanks([...banks, newBank]);
            setIsAddingBank(false);
            setIsLinking(false);
        }, 1000);
    };

    const handleRemoveBank = (id: string) => {
        setBanks(banks.filter(b => b.id !== id));
    };

    const toggleBalance = (id: string) => {
        setBanks(banks.map(b => b.id === id ? { ...b, balanceVisible: !b.balanceVisible } : b));
    };

    const handleAddMoney = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) return;

        setIsAddingMoney(true);
        // Simulate an ACH/UPI pull from the default bank
        setTimeout(() => {
            setBalance(prev => prev + Number(addAmount));
            setAddAmount('');
            setIsAddingMoney(false);
        }, 1200);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-xl border border-slate-100 max-w-md w-full relative z-20">
            {/* GlobePay Balance Section */}
            <div className="mb-8">
                <div className="flex items-center text-slate-500 font-medium mb-1">
                    <Wallet className="w-4 h-4 mr-2" />
                    GlobePay Balance
                </div>
                <div className="text-4xl font-extrabold text-[#0A1128]">
                    ₹{balance.toFixed(2)} <span className="text-lg text-slate-500 font-normal">INR</span>
                </div>
            </div>

            {/* Add Money Form */}
            <form onSubmit={handleAddMoney} className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-slate-600 mb-2">Add Money to GlobePay</label>
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                        <input
                            type="number"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            placeholder="Amount"
                            disabled={isAddingMoney || banks.length === 0}
                            className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isAddingMoney || banks.length === 0 || !addAmount}
                        className="bg-[#0A1128] hover:bg-[#15234b] disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-bold flex items-center transition"
                    >
                        {isAddingMoney ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <ArrowDown className="w-4 h-4 mr-1" />
                                Add
                            </>
                        )}
                    </button>
                </div>
                {banks.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">Link a bank account first to add funds.</p>
                )}
            </form>

            {/* Linked Banks Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
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
                                        {IND_BANKS.map(b => <option key={b.name} value={b.name}>{b.icon} {b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Account Number (15 Digits)</label>
                                    <input
                                        type="password"
                                        required
                                        value={newAccNum}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, ''); // Only allow digits
                                            if (val.length <= 15) setNewAccNum(val);
                                        }}
                                        maxLength={15}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
                                        placeholder="Enter 15 digit account number"
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
                                            if (val.length <= 15) setConfirmAccNum(val);
                                        }}
                                        maxLength={15}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
                                        placeholder="Re-enter 15 digit account number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">IFSC Code</label>
                                    <input type="text" required value={newIfsc} onChange={e => setNewIfsc(e.target.value.toUpperCase())} maxLength={11} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 uppercase" placeholder="e.g. SBIN0001234" />
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
                                <div key={bank.id} className="p-3 border border-slate-200 rounded-xl hover:border-slate-300 transition bg-white relative group">
                                    <div className="flex items-center justify-between mb-2">
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
                                            {bank.balanceVisible ? `₹ ${bank.mockBalance.toLocaleString('en-IN')}` : '₹ ••••••'}
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
