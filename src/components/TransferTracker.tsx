"use client";

import { CheckCircle, Circle, Clock } from 'lucide-react';

interface TransferTrackerProps {
    status: 'idle' | 'draft' | 'initiated' | 'processing' | 'funded' | 'converted' | 'completed' | 'failed';
}

export function TransferTracker({ status }: TransferTrackerProps) {

    // Ordered steps for the vertical timeline
    const steps = [
        { id: 'initiated', label: 'Payment Initialized' },
        { id: 'funded', label: 'Payment Received' },
        { id: 'converted', label: 'Converted via Partner' },
        { id: 'completed', label: 'Deposited Internally' }
    ];

    // Determine numerical progress
    const getProgressIndex = () => {
        if (status === 'completed') return 4;
        if (status === 'converted') return 3;
        if (status === 'funded') return 2;
        if (status === 'initiated' || status === 'processing') return 1;
        return 0; // idle or draft
    };

    const currentIndex = getProgressIndex();

    return (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 h-full w-full sticky top-24">
            <h3 className="text-xl font-bold text-[#0A1128] mb-8">Transfer Status</h3>

            {status === 'idle' || status === 'draft' ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Clock className="w-6 h-6 text-slate-300" />
                    </div>
                    Start a transfer to track its progress here.
                </div>
            ) : status === 'failed' ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm text-center">
                    This transfer has failed. Please contact support.
                </div>
            ) : (
                <div className="relative pl-4 space-y-8">
                    {/* Vertical Line Connector */}
                    <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-100 z-0"></div>
                    <div
                        className="absolute left-[27px] top-6 w-0.5 bg-green-500 z-0 transition-all duration-500 ease-in-out"
                        style={{ height: `${(currentIndex / 4) * 100}%` }}
                    ></div>

                    {steps.map((step, index) => {
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div key={step.id} className="relative z-10 flex items-start group">
                                <div className="shrink-0 mr-4">
                                    {isCompleted ? (
                                        <CheckCircle className="w-7 h-7 text-green-500 bg-white rounded-full" />
                                    ) : isCurrent ? (
                                        <div className="w-7 h-7 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm">
                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                                        </div>
                                    ) : (
                                        <Circle className="w-7 h-7 text-slate-200 bg-white rounded-full" />
                                    )}
                                </div>
                                <div className="mt-1">
                                    <h4 className={`font-bold text-sm ${isCompleted || isCurrent ? 'text-[#0A1128]' : 'text-slate-400'}`}>
                                        {step.label}
                                    </h4>
                                    {isCurrent && (
                                        <p className="text-xs text-blue-600 mt-1 font-medium">In Progress...</p>
                                    )}
                                    {isCompleted && (
                                        <p className="text-xs text-green-600 mt-1 font-medium">Done</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-12 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                <div className="flex items-center space-x-2 text-blue-800 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                    <span>Secure & Encrypted</span>
                </div>
                <p className="text-xs text-blue-600/70 mt-2 leading-relaxed">
                    Your transfer is protected by bank-level encryption. GlobePay ensures your funds are tracked at every hop.
                </p>
            </div>
        </div>
    );
}
