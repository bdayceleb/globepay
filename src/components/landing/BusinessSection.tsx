"use client";

import { motion } from 'framer-motion';
import { Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function BusinessSection() {
    return (
        <div className="py-24 sm:py-32 bg-[#00B9FF] relative overflow-hidden">

            {/* Decorative Blob */}
            <div className="absolute bottom-0 right-0 -mr-48 -mb-48 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">

                {/* Left Side Copy */}
                <div className="lg:w-1/2">
                    <div className="inline-flex items-center space-x-2 bg-[#0A1128] text-white px-4 py-2 rounded-full mb-8">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-bold text-sm uppercase tracking-wide">GlobePay Business</span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#0A1128] tracking-tight leading-[1.1] mb-8">
                        Do business without borders.
                    </h2>
                    <p className="text-xl text-[#0A1128]/80 mb-10 leading-relaxed font-medium">
                        Pay overseas staff, receive international vendor payments, and manage cash flow in 40+ currencies. The international business account built to save you time and money.
                    </p>

                    <ul className="space-y-4 mb-12 text-[#0A1128] font-bold text-lg">
                        <li className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-[#0A1128] mr-4"></div>
                            Pay invoices in 70+ countries
                        </li>
                        <li className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-[#0A1128] mr-4"></div>
                            Receive payments like a local
                        </li>
                        <li className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-[#0A1128] mr-4"></div>
                            Batch payouts to up to 1,000 people
                        </li>
                    </ul>

                    <Link href="/dashboard" className="px-8 py-4 bg-[#0A1128] hover:bg-[#15234b] text-[#DDF51A] rounded-full font-bold text-lg inline-block transition">
                        See business features
                    </Link>
                </div>

                {/* Right Side Image / Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="lg:w-1/2 w-full"
                >
                    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 relative">
                        <div className="bg-[#0A1128] px-8 py-6 flex justify-between items-center">
                            <span className="text-white font-bold text-xl">Batch Payments</span>
                            <span className="bg-[#00B9FF] text-[#0A1128] px-3 py-1 rounded-full text-xs font-bold">In Progress</span>
                        </div>
                        <div className="p-8 space-y-6">

                            <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                                <div>
                                    <span className="block font-bold text-[#0A1128] text-lg">Freelancer Team India</span>
                                    <span className="block text-sm text-gray-500">Invoice #2026-04</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-[#0A1128] text-xl">- ₹4,50,000</span>
                                    <span className="block text-sm text-green-600 font-medium">Sent</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                                <div>
                                    <span className="block font-bold text-[#0A1128] text-lg">European Supplier</span>
                                    <span className="block text-sm text-gray-500">Logistics Q2</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-[#0A1128] text-xl">- €12,400</span>
                                    <span className="block text-sm text-green-600 font-medium">Sent</span>
                                </div>
                            </div>

                            <div className="flex items-center text-[#00B9FF] font-bold group cursor-pointer">
                                <span>View all 45 automated payouts</span>
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>

                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
