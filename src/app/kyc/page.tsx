"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KycPage() {
    const [fullName, setFullName] = useState('');
    const [aadharCard, setAadharCard] = useState('');
    const [panCard, setPanCard] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [countryCode, setCountryCode] = useState('+1');

    // Redirect if not logged in
    useEffect(() => {
        fetch('/api/auth/user').then(res => res.json()).then(data => {
            if (!data.authenticated) {
                router.push('/login');
            } else if (data.user.isKycComplete) {
                router.push('/dashboard');
            } else {
                setCountryCode(data.user.countryCode || '+1');

                // If KYC data was pre-filled during registration, skip this step natively
                if (data.user.kycData) {
                    // Quick background submission
                    fetch('/api/kyc/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fullName: "Auto-Verified User",
                            countryCode: data.user.countryCode,
                            kycData: data.user.kycData
                        }),
                    }).then(() => router.push('/dashboard'));
                }
            }
        });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        let kycData: any = {};
        if (countryCode === '+91') {
            kycData = { aadhaar: aadharCard, pan: panCard };
        } else if (countryCode === '+1') {
            kycData = { ssn: aadharCard }; // re-using state var for simplicity
        } else {
            kycData = { nationalId: aadharCard };
        }

        try {
            const res = await fetch('/api/kyc/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, countryCode, kycData }),
            });

            const data = await res.json();
            if (data.success) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Failed to submit KYC');
            }
        } catch (err) {
            setError('An error occurred');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-[#0A1128] mb-2">Verify your identity</h2>
                <p className="text-center text-gray-500 mb-8">We require standard KYC documentation under the Prevention of Money Laundering Act (PMLA).</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition"
                            placeholder="As it appears on your ID"
                        />
                    </div>

                    {countryCode === '+91' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={aadharCard}
                                    onChange={(e) => setAadharCard(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition"
                                    placeholder="12 digit Aadhar number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={panCard}
                                    onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition uppercase uppercase-placeholder"
                                    placeholder="ABCDE1234F"
                                />
                            </div>
                        </>
                    ) : countryCode === '+1' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Social Security Number (SSN) <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                required
                                value={aadharCard}
                                onChange={(e) => setAadharCard(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition font-mono"
                                placeholder="XXX-XX-XXXX"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">National ID / Passport Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={aadharCard}
                                onChange={(e) => setAadharCard(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B9FF] focus:border-transparent outline-none transition"
                                placeholder="Document Number"
                            />
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start mt-6 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        <p>Your data is encrypted securely. GlobePay simulates this environment and does not transmit these details externally.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0A1128] text-white font-bold py-4 rounded-full hover:bg-[#15234b] transition disabled:opacity-70 mt-6"
                    >
                        {loading ? 'Submitting...' : 'Submit & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
