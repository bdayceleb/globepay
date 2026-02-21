"use client";

import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function DebitCardSection() {
    return (
        <div className="py-24 sm:py-32 bg-white relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-24 relative z-10">

                {/* Left Side Abstract Card Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="lg:w-1/2 w-full flex justify-center lg:justify-start relative"
                >
                    {/* Card Mockup */}
                    <div className="w-[400px] h-[250px] bg-[#DDF51A] rounded-2xl shadow-2xl relative overflow-hidden transform rotate-[-10deg] hover:rotate-[-5deg] transition-all duration-500 z-20 border border-yellow-200">
                        <div className="absolute top-6 left-6">
                            <img src="/logo.svg" alt="Card Logo" className="w-12 h-12 mix-blend-multiply" />
                        </div>

                        {/* Fake Chip */}
                        <div className="absolute top-20 left-6 w-12 h-10 bg-yellow-200 rounded border border-yellow-400 opacity-60"></div>

                        <div className="absolute bottom-6 left-6">
                            <span className="font-bold text-[#0A1128] opacity-80 text-xl tracking-widest">**** **** **** 4092</span>
                            <div className="mt-2 text-[#0A1128] font-bold">DEEPAK SINGH</div>
                        </div>

                        {/* Globe Mark */}
                        <div className="absolute bottom-6 right-6 flex space-x-1">
                            <div className="w-8 h-8 rounded-full bg-[#0A1128] opacity-10"></div>
                            <div className="w-8 h-8 rounded-full bg-[#0A1128] opacity-20 -ml-4"></div>
                        </div>
                    </div>

                    {/* Decorative Backing */}
                    <div className="w-[400px] h-[250px] bg-[#0A1128] rounded-2xl shadow-xl absolute top-10 left-10 transform rotate-[5deg] z-10"></div>
                </motion.div>

                {/* Right Side Copy */}
                <div className="lg:w-1/2">
                    <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#0A1128] tracking-tight leading-[1.1] mb-8">
                        Meet the GlobePay card. Spend wherever you are.
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                        Spend in over 150 countries at the mid-market rate, with low, transparent fees. Whether you're buying chai in Mumbai or coffee in New York, we automatically convert your balance at the best rate.
                    </p>

                    <ul className="space-y-6 mb-12">
                        <li className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E4E7EC] flex items-center justify-center mt-1">
                                <CreditCard className="w-4 h-4 text-[#0A1128]" />
                            </div>
                            <div className="ml-4">
                                <h4 className="text-xl font-bold text-[#0A1128]">Always the best exchange rate</h4>
                                <p className="text-gray-600 mt-1">We auto-convert your balance for the lowest possible fee.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E4E7EC] flex items-center justify-center mt-1">
                                <ShieldCheck className="w-4 h-4 text-[#0A1128]" />
                            </div>
                            <div className="ml-4">
                                <h4 className="text-xl font-bold text-[#0A1128]">Freeze your card instantly</h4>
                                <p className="text-gray-600 mt-1">Keep your money safe. Freeze and unfreeze with a single tap in the app.</p>
                            </div>
                        </li>
                    </ul>

                    <Link href="/dashboard" className="px-8 py-4 bg-[#0A1128] hover:bg-[#15234b] text-white rounded-full font-bold text-lg inline-block transition">
                        Order your card
                    </Link>
                </div>

            </div>
        </div>
    );
}
