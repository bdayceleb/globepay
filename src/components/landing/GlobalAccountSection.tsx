"use client";

import { motion } from 'framer-motion';
import { Wallet, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function GlobalAccountSection() {
    return (
        <div className="py-24 sm:py-32 bg-[#F2F4F7] relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">

                {/* Left Side Copy */}
                <div className="lg:w-1/2">
                    <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#0A1128] tracking-tight leading-[1.1] mb-8">
                        The international account. One account for your global life.
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                        Hold and convert money in 40+ currencies. Plus, get local account details in 9 currencies—including USD, GBP, EUR, and AUD—so you can get paid like a local, no matter where you are.
                    </p>

                    <ul className="space-y-6 mb-12">
                        <li className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00B9FF]/20 flex items-center justify-center mt-1">
                                <Globe className="w-4 h-4 text-[#00B9FF]" />
                            </div>
                            <div className="ml-4">
                                <h4 className="text-xl font-bold text-[#0A1128]">Receive money like a local</h4>
                                <p className="text-gray-600 mt-1">Get your own UK sort code, Euro IBAN, US routing number, and more.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DDF51A] flex items-center justify-center mt-1">
                                <Wallet className="w-4 h-4 text-[#0A1128]" />
                            </div>
                            <div className="ml-4">
                                <h4 className="text-xl font-bold text-[#0A1128]">Hold 40+ currencies safely</h4>
                                <p className="text-gray-600 mt-1">Convert between currencies in seconds at the real exchange rate.</p>
                            </div>
                        </li>
                    </ul>

                    <Link href="/dashboard" className="inline-flex items-center font-bold text-[#00B9FF] hover:text-[#0092cc] text-lg group">
                        Explore the account
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Right Side Image Mockup */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="lg:w-1/2 w-full"
                >
                    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 p-8 pt-12">
                        <h3 className="text-center font-bold text-gray-500 mb-8 tracking-wider uppercase text-sm">Balances</h3>

                        {/* Mock Balances */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 shadow-sm border border-gray-200">
                                        <img src="https://flagcdn.com/w80/eu.png" alt="EUR" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-[#0A1128] text-lg">Euro</span>
                                        <span className="block text-sm text-gray-500">EUR balance</span>
                                    </div>
                                </div>
                                <span className="font-bold text-[#0A1128] text-xl">€3,450.00</span>
                            </div>

                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 shadow-sm border border-gray-200">
                                        <img src="https://flagcdn.com/w80/us.png" alt="USD" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-[#0A1128] text-lg">US Dollar</span>
                                        <span className="block text-sm text-gray-500">USD balance</span>
                                    </div>
                                </div>
                                <span className="font-bold text-[#0A1128] text-xl">$12,890.50</span>
                            </div>

                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl opacity-70">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 shadow-sm border border-gray-200">
                                        <img src="https://flagcdn.com/w80/gb.png" alt="GBP" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-[#0A1128] text-lg">British Pound</span>
                                        <span className="block text-sm text-gray-500">GBP balance</span>
                                    </div>
                                </div>
                                <span className="font-bold text-[#0A1128] text-xl">£840.20</span>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-4 bg-[#0A1128] text-white rounded-xl font-bold flex items-center justify-center hover:bg-[#15234b] transition">
                            + Open a balance
                        </button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
