"use client";

import { motion } from 'framer-motion';

const steps = [
    {
        id: '1',
        title: 'Register for free',
        description: 'Sign up online or in our app for free. All you need is an email address, or a Google account.',
    },
    {
        id: '2',
        title: 'Choose an amount',
        description: 'Tell us how much you want to send. We’ll show you our fees up front, and tell you when your money should arrive.',
    },
    {
        id: '3',
        title: 'Add recipient details',
        description: 'Fill in the details of your family\'s bank account or UPI ID. We save it securely for next time.',
    },
    {
        id: '4',
        title: 'Pay and relax',
        description: 'Pay with your bank account or card. We convert it instantly and send it over the Solana network.',
    }
];

export function HowItWorks() {
    return (
        <div className="py-24 sm:py-32 bg-[#0A1128] relative overflow-hidden">

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24">

                {/* Left Side Content */}
                <div className="lg:w-1/2">
                    <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.1] mb-8">
                        How to send money with GlobePay.
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 leading-relaxed font-light max-w-lg">
                        Sending money shouldn't be complicated. We've made it as simple as sending a text message, but with bank-grade security.
                    </p>
                    <button className="bg-[#DDF51A] hover:bg-[#c5dc17] text-[#0A1128] px-8 py-4 rounded-full text-lg font-bold transition">
                        Send money now
                    </button>
                </div>

                {/* Right Side Timeline */}
                <div className="lg:w-1/2 pt-4">
                    <div className="relative border-l-2 border-white/20 pl-10 space-y-16">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="relative"
                            >
                                {/* Number Bullet */}
                                <div className="absolute -left-[61px] top-0 w-10 h-10 rounded-full bg-[#0A1128] border-2 border-white flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">{step.id}</span>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 mt-1 tracking-tight">{step.title}</h3>
                                <p className="text-blue-100 text-lg leading-relaxed max-w-md">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
