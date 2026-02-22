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
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 h-full w-full">
            <h3 className="text-xl font-bold text-[#0A1128] mb-6">Recent Transfers</h3>

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
                <div className="space-y-4">
                    {transfers.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50 group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.fromCountry === 'US' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {tx.fromCountry === 'US' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    </div>
                                    <div>
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
