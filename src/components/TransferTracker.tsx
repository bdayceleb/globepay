"use client";

import { CheckCircle, Circle, Clock } from 'lucide-react';

interface TransferTrackerProps {
    status: 'idle' | 'draft' | 'initiated' | 'processing' | 'funded' | 'converted_to_usdc' | 'broadcasted_to_solana' | 'confirmed_on_chain' | 'off_ramp_processing' | 'completed' | 'failed';
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
        if (status === 'off_ramp_processing' || status === 'confirmed_on_chain') return 3;
        if (status === 'broadcasted_to_solana' || status === 'converted_to_usdc') return 2;
        if (status === 'funded' || status === 'initiated' || status === 'processing') return 1;
        return 0; // idle or draft
    };

    const currentIndex = getProgressIndex();

    return (
        <div className="relative bg-white/90 backdrop-blur-2xl p-6 sm:p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 w-full hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden sticky top-24">
            <h3 className="text-xl font-extrabold text-[#0A1128] mb-8 relative z-10 tracking-tight">Transfer Status</h3>

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
                                <div className="shrink-0 mr-5">
                                    {isCompleted ? (
                                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-200 shadow-sm relative z-10">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                    ) : isCurrent ? (
                                        <div className="w-8 h-8 rounded-full bg-white border-[2.5px] border-blue-500 flex items-center justify-center shadow-md relative z-10 ring-4 ring-blue-50">
                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center z-10 relative">
                                            <Circle className="w-3 h-3 text-slate-300" />
                                        </div>
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
