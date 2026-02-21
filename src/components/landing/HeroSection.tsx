"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, Lock, ArrowDownUp } from 'lucide-react';

const CURRENCIES = [
    { code: 'USD', flag: 'us' },
    { code: 'INR', flag: 'in' },
    { code: 'EUR', flag: 'eu' },
    { code: 'GBP', flag: 'gb' },
    { code: 'CAD', flag: 'ca' },
    { code: 'AUD', flag: 'au' },
];

export function HeroSection() {
    const [fromCurrency, setFromCurrency] = useState(CURRENCIES[0]);
    const [toCurrency, setToCurrency] = useState(CURRENCIES[1]);
    const [sendAmount, setSendAmount] = useState<string>("1000");
    const [receiveAmount, setReceiveAmount] = useState<string>("");
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);

    const [isFromOpen, setIsFromOpen] = useState(false);
    const [isToOpen, setIsToOpen] = useState(false);

    const fromRef = useRef<HTMLDivElement>(null);
    const toRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
                setIsFromOpen(false);
            }
            if (toRef.current && !toRef.current.contains(event.target as Node)) {
                setIsToOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch Real-time rates
    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency.code}`);
                const data = await res.json();
                if (data && data.rates && data.rates[toCurrency.code]) {
                    setExchangeRate(data.rates[toCurrency.code]);
                }
            } catch (err) {
                console.error("Failed to fetch rates:", err);
            }
        };
        fetchRate();
        // Poll every 60 seconds
        const interval = setInterval(fetchRate, 60000);
        return () => clearInterval(interval);
    }, [fromCurrency.code, toCurrency.code]);

    // Network fee visualization
    const networkFee = fromCurrency.code === 'USD' ? 0.0003 : (fromCurrency.code === 'INR' ? 0.02 : 0.01);

    useEffect(() => {
        if (exchangeRate !== null) {
            const amount = parseFloat(sendAmount) || 0;
            const afterFee = amount > networkFee ? amount - networkFee : 0;
            setReceiveAmount((afterFee * exchangeRate).toFixed(2));
        } else {
            setReceiveAmount("Calculating...");
        }
    }, [sendAmount, exchangeRate, networkFee]);

    const handleSwap = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
    };

    return (
        <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#0A1128]">

            {/* Background decorative elements to make it premium */}
            <div className="absolute top-0 right-0 -mr-48 -mt-48 w-[800px] h-[800px] rounded-full bg-blue-900/20 blur-3xl"></div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">

                    {/* Left Column: Copy */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="flex-1 text-center lg:text-left mt-8 lg:mt-0"
                    >
                        <h1 className="text-4xl sm:text-6xl lg:text-[80px] font-bold text-white tracking-tight leading-[1.05] mb-6 sm:mb-8">
                            Money without borders.
                        </h1>
                        <p className="text-[22px] text-blue-100 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                            Send money to and from anywhere faster and cheaper than ever before. Powered by real-time mid-market rates and invisible blockchain rails.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link href="/dashboard" className="w-full sm:w-auto px-10 py-4 bg-[#DDF51A] hover:bg-[#c5dc17] text-[#0A1128] rounded-full font-bold text-lg transition text-center">
                                Open an account
                            </Link>
                            <Link href="/dashboard" className="w-full sm:w-auto px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-lg transition border border-white/10 text-center">
                                Send money now
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center justify-center lg:justify-start text-blue-200 text-sm font-medium">
                            <Lock className="w-4 h-4 mr-2" />
                            Regulated globally, secure transactions.
                        </div>
                    </motion.div>

                    {/* Right Column: Calculator Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="w-full max-w-[480px] lg:w-[480px] shrink-0 mx-auto"
                    >
                        <div className="bg-white rounded-[24px] shadow-2xl p-5 sm:p-8">

                            {/* Send Input */}
                            <div className="relative">
                                <div className="bg-white rounded-xl border border-gray-300 p-4 hover:border-gray-400 transition focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 z-20 relative flex justify-between items-center">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <label className="text-[13px] sm:text-sm font-medium text-gray-500 block mb-1 truncate">You send</label>
                                        <input
                                            type="number"
                                            value={sendAmount}
                                            onChange={(e) => setSendAmount(e.target.value)}
                                            className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-[#1A2B4C] outline-none"
                                        />
                                    </div>

                                    <div className="relative" ref={fromRef}>
                                        <div
                                            onClick={() => setIsFromOpen(!isFromOpen)}
                                            className="flex items-center bg-[#F2F4F7] hover:bg-[#E4E7EC] cursor-pointer px-3 sm:px-4 py-3 rounded-xl ml-2 sm:ml-4 transition"
                                        >
                                            <div className="hidden sm:block w-6 h-6 rounded-full overflow-hidden mr-2 shrink-0">
                                                <img src={`https://flagcdn.com/w40/${fromCurrency.flag}.png`} alt="Flag" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-[#1A2B4C] text-[15px] sm:text-lg mr-1 sm:mr-2">{fromCurrency.code}</span>
                                            <ChevronDown className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500 shrink-0" />
                                        </div>

                                        <AnimatePresence>
                                            {isFromOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                                >
                                                    {CURRENCIES.map(curr => (
                                                        <div
                                                            key={curr.code}
                                                            onClick={() => { setFromCurrency(curr); setIsFromOpen(false); }}
                                                            className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            <div className="w-5 h-5 rounded-full overflow-hidden mr-3">
                                                                <img src={`https://flagcdn.com/w40/${curr.flag}.png`} alt="Flag" className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="font-bold text-[#1A2B4C]">{curr.code}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Breakdown */}
                            <div className="pl-6 relative">
                                {/* Connecting Line */}
                                <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-gray-200 z-0"></div>

                                {/* Swap Button Overlap */}
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-30">
                                    <button
                                        onClick={handleSwap}
                                        className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition shadow-sm text-[#1A2B4C]"
                                    >
                                        <ArrowDownUp className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="relative z-10 flex items-center mb-4 mt-6">
                                    <div className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center -ml-[3px]">
                                        <span className="text-gray-600 font-bold text-xl leading-none -mt-1">-</span>
                                    </div>
                                    <div className="ml-4 flex justify-between w-full pr-2">
                                        <span className="text-[15px] font-medium text-gray-500">Fast Transfer Fee</span>
                                        <span className="text-[15px] font-bold text-gray-800">{networkFee} {fromCurrency.code}</span>
                                    </div>
                                </div>

                                <div className="relative z-10 flex items-center mb-4">
                                    <div className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center -ml-[3px]">
                                        <span className="text-gray-600 font-bold text-xl leading-none -mt-1">=</span>
                                    </div>
                                    <div className="ml-4 flex justify-between w-full pr-2">
                                        <span className="text-[15px] font-medium text-gray-500">Amount we'll convert</span>
                                        <span className="text-[15px] font-bold text-gray-800">{((parseFloat(sendAmount) || 0) > networkFee ? ((parseFloat(sendAmount) || 0) - networkFee) : 0).toFixed(4)} {fromCurrency.code}</span>
                                    </div>
                                </div>

                                <div className="relative z-10 flex items-center mb-6">
                                    <div className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center -ml-[3px]">
                                        <span className="text-gray-600 font-bold text-lg leading-none">×</span>
                                    </div>
                                    <div className="ml-4 flex justify-between w-full pr-2">
                                        <span className="text-[15px] font-medium text-[#00B9FF] underline decoration-dashed underline-offset-4 cursor-pointer">Real-time exchange rate</span>
                                        <span className="text-[15px] font-bold text-[#1A2B4C]">{exchangeRate !== null ? exchangeRate.toFixed(4) : "Loading..."}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Receive Output */}
                            <div className="relative">
                                <div className="bg-[#F9FAFB] rounded-xl border border-gray-300 p-4 flex justify-between items-center z-10 relative">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <label className="text-[13px] sm:text-sm font-medium text-gray-500 block mb-1 truncate">Recipient gets</label>
                                        <input
                                            disabled
                                            value={receiveAmount}
                                            className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-[#1A2B4C] outline-none truncate"
                                        />
                                    </div>

                                    <div className="relative" ref={toRef}>
                                        <div
                                            onClick={() => setIsToOpen(!isToOpen)}
                                            className="flex items-center bg-[#1A2B4C] hover:bg-[#0A1128] cursor-pointer px-3 sm:px-4 py-3 rounded-xl ml-2 sm:ml-4 transition"
                                        >
                                            <div className="hidden sm:flex w-6 h-6 rounded-full overflow-hidden mr-2 items-center justify-center bg-white shrink-0">
                                                <img src={`https://flagcdn.com/w40/${toCurrency.flag}.png`} alt="Flag" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-white text-[15px] sm:text-lg mr-1 sm:mr-2">{toCurrency.code}</span>
                                            <ChevronDown className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300 shrink-0" />
                                        </div>

                                        <AnimatePresence>
                                            {isToOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                                >
                                                    {CURRENCIES.map(curr => (
                                                        <div
                                                            key={curr.code}
                                                            onClick={() => { setToCurrency(curr); setIsToOpen(false); }}
                                                            className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            <div className="w-5 h-5 rounded-full overflow-hidden mr-3">
                                                                <img src={`https://flagcdn.com/w40/${curr.flag}.png`} alt="Flag" className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="font-bold text-[#1A2B4C]">{curr.code}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Savings / Delivery */}
                            <div className="mt-6 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-[15px]">
                                    <span className="font-medium text-gray-600">You could save vs banks</span>
                                    <span className="font-bold text-gray-800">~{((parseFloat(sendAmount) || 0) * 0.035).toFixed(2)} {fromCurrency.code}</span>
                                </div>
                                <div className="flex justify-between items-center text-[15px]">
                                    <span className="font-medium text-gray-600">Should arrive</span>
                                    <span className="font-bold text-green-600">in seconds</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Link href="/dashboard" className="block w-full text-center py-4 bg-[#DDF51A] hover:bg-[#c5dc17] text-[#0A1128] text-lg font-bold rounded-full transition">
                                    Get started
                                </Link>
                            </div>

                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
