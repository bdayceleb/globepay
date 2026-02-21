"use client";

import { motion } from 'framer-motion';
import { Shield, Zap, Globe2 } from 'lucide-react';

const features = [
    {
        name: 'Send money faster',
        description: 'We use Solana blockchain rails to bypass Swift networks entirely. Unseen to you, money settles in milliseconds, not days.',
        icon: Zap,
        color: 'bg-[#DDF51A]',
    },
    {
        name: 'Save on every transfer',
        description: 'Stop paying ridiculous markup rates. Our Solana infrastructure costs fractions of a cent, passing the massive savings directly to you.',
        icon: Globe2,
        color: 'bg-[#00B9FF]',
    },
    {
        name: 'Bank-level security',
        description: 'Your fiat is held in regulated bank accounts until the exact moment of exchange. Fully compliant, encrypted, and safe.',
        icon: Shield,
        color: 'bg-green-400',
    },
];

export function FeaturesSection() {
    return (
        <div className="py-24 sm:py-32 bg-[#F8FAFC] relative overflow-hidden">

            {/* Decorative Creative Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#DDF51A]/20 blur-[100px] mix-blend-multiply"></div>
                <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#00B9FF]/10 blur-[100px] mix-blend-multiply"></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] rounded-full bg-indigo-200/30 blur-[120px] mix-blend-multiply"></div>

                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz48L3N2Zz4=')] opacity-50 z-0"></div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">

                <div className="text-left max-w-4xl mb-20">
                    <h2 className="text-4xl sm:text-5xl lg:text-[64px] font-bold text-[#0A1128] tracking-tight leading-[1.05]">
                        Meet the new standard in <span className="text-[#00B9FF]">global transfers.</span>
                    </h2>
                    <p className="mt-8 text-xl text-gray-600 max-w-2xl leading-relaxed">
                        We rebuilt the standard remittance pipeline from the ground up to give NRIs the cheapest and fastest transfers imaginable.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pl-0">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
                            className="bg-white/80 backdrop-blur-xl p-10 rounded-[32px] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${feature.color} transform -rotate-3`}>
                                <feature.icon className="w-8 h-8 text-[#0A1128]" aria-hidden="true" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#0A1128] mb-4 tracking-tight">{feature.name}</h3>
                            <p className="text-gray-600 leading-relaxed text-[17px]">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
}
