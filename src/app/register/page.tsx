"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [step, setStep] = useState<1 | 2>(1);

    // Step 1 Details
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    // Step 2 OTP
    const [emailOtp, setEmailOtp] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const fullPhone = `${countryCode}${phone}`;
            // First simulate sending the OTP
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone: fullPhone }),
            });

            const data = await res.json();
            if (data.success) {
                setStep(2); // Move to OTP Verification screen
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('An error occurred contacting the server');
        }
        setLoading(false);
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // For the investor pitch, ONLY accept "123456" as the OTP
        if (emailOtp !== '123456' || phoneOtp !== '123456') {
            setError("Invalid OTP. Please use '123456' for this demo.");
            setLoading(false);
            return;
        }

        try {
            const fullPhone = `${countryCode}${phone}`;
            // Both OTPs verified, proceed to actual registration
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone: fullPhone, password }),
            });

            const data = await res.json();
            if (data.success) {
                router.push('/kyc');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Database Error. Ensure Firestore is Enable in Firebase Console.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10">
                <div className="flex justify-center mb-8">
                    <img src="/logo.svg" alt="GlobePay" className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-center text-[#0A1128] mb-8">Create your GlobePay account</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="flex space-x-2">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="w-1/3 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition bg-white"
                                >
                                    <option value="+1">🇺🇸 +1 (US)</option>
                                    <option value="+44">🇬🇧 +44 (UK)</option>
                                    <option value="+91">🇮🇳 +91 (IN)</option>
                                    <option value="+61">🇦🇺 +61 (AU)</option>
                                    <option value="+81">🇯🇵 +81 (JP)</option>
                                    <option value="+49">🇩🇪 +49 (DE)</option>
                                    <option value="+33">🇫🇷 +33 (FR)</option>
                                    <option value="+55">🇧🇷 +55 (BR)</option>
                                    <option value="+27">🇿🇦 +27 (ZA)</option>
                                    <option value="+971">🇦🇪 +971 (AE)</option>
                                </select>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-2/3 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition"
                                    placeholder="(555) 000-0000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0A1128] text-white font-bold py-4 rounded-full hover:bg-[#15234b] transition disabled:opacity-70 mt-2"
                        >
                            {loading ? 'Sending OTPs...' : 'Continue'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6">
                            We've sent a 6-digit code to both your email and phone number.
                            <br /><span className="font-bold opacity-75">(Demo Tip: Enter '123456')</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email OTP for {email}</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={emailOtp}
                                onChange={(e) => setEmailOtp(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition text-center tracking-[0.5em] font-mono text-lg"
                                placeholder="------"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMS OTP for {phone}</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={phoneOtp}
                                onChange={(e) => setPhoneOtp(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition text-center tracking-[0.5em] font-mono text-lg"
                                placeholder="------"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || emailOtp.length < 6 || phoneOtp.length < 6}
                            className="w-full bg-[#DDF51A] text-[#0A1128] font-bold py-4 rounded-full hover:bg-[#c5dc17] transition disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Verifying & Registering...' : 'Verify & Create Account'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 mt-2"
                        >
                            ← Back to details
                        </button>
                    </form>
                )}

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account? <Link href="/login" className="text-[#00B9FF] font-bold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}
