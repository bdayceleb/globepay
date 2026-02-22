"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, User as UserIcon, Lock, Mail, Phone, CreditCard } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetch('/api/auth/user').then(res => res.json()).then(data => {
            if (!data.authenticated) {
                router.push('/login');
            } else {
                setUser(data.user);
                setIsLoading(false);
            }
        }).catch(() => {
            router.push('/login');
        });
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        setIsChangingPassword(true);

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();

            if (res.ok) {
                setPasswordMessage({ type: 'success', text: 'Password successfully updated.' });
                setCurrentPassword('');
                setNewPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password.' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div></div>;
    }

    return (
        <main className="min-h-screen pb-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-white selection:bg-blue-100">
            {/* Header */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="flex items-center">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                                <img src="/logo.svg" alt="GlobePay Logo" className="w-8 h-8" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-800">
                                GlobePay
                            </span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-[#0A1128] transition hidden md:block">Dashboard</Link>
                            <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-[#0A1128] transition bg-slate-100 px-4 py-2 rounded-lg">Log out</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 mb-16 space-y-8">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-extrabold text-[#0A1128] tracking-tight mb-2">My Profile</h1>
                    <p className="text-slate-500 font-medium">Manage your personal settings and security.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: User Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/60 p-6 md:p-8">
                            <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-slate-100">
                                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                    {user?.kycDetails?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[#0A1128]">{user?.kycDetails?.fullName || 'Verified User'}</h2>
                                    <div className="flex items-center text-sm text-slate-500 mt-1">
                                        <Mail className="w-4 h-4 mr-1.5" />
                                        {user?.email}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                                    <div className="font-medium flex items-center text-slate-800">
                                        <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                        {user?.phone || 'Not provided'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">KYC Status</label>
                                    <div className="font-medium flex items-center text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full text-sm">
                                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                                        Verified
                                    </div>
                                </div>
                                {user?.countryCode === '+91' ? (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">PAN Card</label>
                                            <div className="font-medium text-slate-800 font-mono tracking-widest">{user?.kycDetails?.panCard || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Aadhar Card</label>
                                            <div className="font-medium text-slate-800 font-mono tracking-widest">•••• •••• {user?.kycDetails?.aadharCard?.slice(-4) || 'N/A'}</div>
                                        </div>
                                    </>
                                ) : user?.countryCode === '+1' ? (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Social Security Number</label>
                                            <div className="font-medium text-slate-800 font-mono tracking-widest">••• •• {user?.kycDetails?.ssn?.slice(-4) || 'N/A'}</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">National ID</label>
                                            <div className="font-medium text-slate-800 font-mono tracking-widest">{user?.kycDetails?.nationalId || 'N/A'}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Security Section (Password Change) */}
                        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/60 p-6 md:p-8">
                            <h3 className="text-lg font-bold text-[#0A1128] flex items-center mb-6">
                                <Lock className="w-5 h-5 mr-2 text-blue-500" />
                                Security Settings
                            </h3>

                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                                {passwordMessage.text && (
                                    <div className={`p-3 rounded-lg text-sm font-medium ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {passwordMessage.text}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        required
                                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                    <p className="text-xs text-slate-500 mt-1.5">Must be at least 8 characters long.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="w-full bg-[#0A1128] hover:bg-[#15234b] text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition disabled:opacity-70 mt-2"
                                >
                                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Cards & Extras */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#0A1128] to-slate-800 rounded-[20px] shadow-lg p-6 text-white relative overflow-hidden group hover:shadow-xl transition-all">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-white/80 text-sm flex items-center mb-6">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Global Fiat Balance
                                </h3>
                                <div className="text-3xl font-black tracking-tight mb-1">
                                    {user?.countryCode === '+91' ? '₹' : user?.countryCode === '+1' ? '$' : '£'}{(user?.fiatBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg text-blue-200 ml-1">{user?.countryCode === '+91' ? 'INR' : user?.countryCode === '+1' ? 'USD' : 'GBP'}</span>
                                </div>
                                <div className="text-xs text-blue-200 px-2 py-1 bg-white/10 rounded-md w-fit font-medium">
                                    Avail. for outbound transfer
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/50 backdrop-blur-sm border border-blue-100 rounded-[20px] p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-800 mb-1">Bank-level Security</h4>
                            <p className="text-xs text-slate-500">Your connection is fully encrypted with AES-256 local database persistence.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
