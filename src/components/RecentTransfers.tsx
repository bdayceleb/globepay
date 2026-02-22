"use client";

import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { TransactionDraft } from '@/lib/db';

interface RecentTransfersProps {
    transfers: TransactionDraft[];
    isLoading: boolean;
}

export function RecentTransfers({ transfers, isLoading }: RecentTransfersProps) {

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    return (
        <div className="relative bg-white/90 backdrop-blur-2xl p-6 sm:p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 w-full hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden h-full">
            <h3 className="text-xl font-extrabold text-[#0A1128] mb-6 relative z-10 tracking-tight">Recent Transfers</h3>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A1128]"></div>
                </div>
            ) : transfers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <ArrowUpRight className="w-6 h-6 text-slate-300" />
                    </div>
                    No recent transfers.
                </div>
            ) : (
                <div className="space-y-4 relative z-10">
                    {transfers.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="p-4 border border-slate-200/60 rounded-2xl hover:border-blue-200 hover:bg-blue-50/20 transition-all bg-white shadow-sm relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.fromCountry === 'US' ? 'bg-blue-100/50 text-blue-600' : 'bg-orange-100/50 text-orange-600'}`}>
                                        {tx.fromCountry === 'US' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                    </div>
                                    <div className="pt-0.5">
                                        <div className="text-sm font-bold text-[#0A1128]">
                                            {tx.fromCountry} → {tx.toCountry}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate max-w-[120px]">
                                            To: {tx.recipientDetails?.name || 'Unnamed'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-[#0A1128]">
                                        {tx.sendAmount.toFixed(2)} {tx.sendCurrency}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center justify-end space-x-1 mt-1">
                                        {getStatusIcon(tx.status)}
                                        <span className="capitalize">{tx.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-2 text-right">
                                {new Date(tx.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
