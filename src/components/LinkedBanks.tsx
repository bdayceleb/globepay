"use client";

import { useState } from 'react';
import { Building2, Plus, PlusCircle, Trash2, Wallet, ArrowDown } from 'lucide-react';

interface BankAccount {
    id: string;
    bankName: string;
    last4: string;
    isDefault: boolean;
}

export function LinkedBanks() {
    const [balance, setBalance] = useState<number>(0);
    const [banks, setBanks] = useState<BankAccount[]>([
        { id: '1', bankName: 'JPMorgan Chase', last4: '4452', isDefault: true },
    ]);
    const [isAddingBank, setIsAddingBank] = useState(false);
    const [isAddingMoney, setIsAddingMoney] = useState(false);
    const [addAmount, setAddAmount] = useState('');

    const handleAddBank = () => {
        setIsAddingBank(true);
        // Simulate an API call to Plaid / Next.js backend
        setTimeout(() => {
            const newBank = {
                id: Date.now().toString(),
                bankName: ['Bank of America', 'Wells Fargo', 'Citibank'][Math.floor(Math.random() * 3)],
                last4: Math.floor(1000 + Math.random() * 9000).toString(),
                isDefault: banks.length === 0,
            };
            setBanks([...banks, newBank]);
            setIsAddingBank(false);
        }, 1500);
    };

    const handleRemoveBank = (id: string) => {
        setBanks(banks.filter(b => b.id !== id));
    };

    const handleAddMoney = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) return;

        setIsAddingMoney(true);
        // Simulate an ACH pull from the default bank
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
                    ${balance.toFixed(2)} <span className="text-lg text-slate-500 font-normal">USD</span>
                </div>
            </div>

            {/* Add Money Form */}
            <form onSubmit={handleAddMoney} className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-slate-600 mb-2">Add Money from Bank</label>
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
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
                    <h3 className="font-bold text-[#0A1128]">Linked Accounts</h3>
                    <button
                        onClick={handleAddBank}
                        disabled={isAddingBank}
                        className="text-sm font-bold text-[#00B9FF] hover:text-blue-700 flex items-center disabled:opacity-50"
                    >
                        {isAddingBank ? 'Linking...' : (
                            <>
                                <Plus className="w-4 h-4 mr-1" /> Link New Bank
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-3">
                    {banks.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
                            No bank accounts linked yet.<br />
                            Link an account to fund your wallet.
                        </div>
                    ) : (
                        banks.map(bank => (
                            <div key={bank.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl group hover:border-slate-300 transition">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-600">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-[#0A1128]">{bank.bankName}</div>
                                        <div className="text-xs text-slate-500">Checking •••• {bank.last4}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveBank(bank.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                    title="Delink Bank Account"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
