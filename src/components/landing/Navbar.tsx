import Link from 'next/link';
import { getSession } from '@/lib/session';

export async function Navbar() {
    const session = await getSession();
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent py-4">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center group">
                            <img src="/logo.svg" alt="GlobePay Logo" className="w-8 h-8 mr-3 brightness-0 invert" />
                            <span className="text-2xl font-bold tracking-tight text-white">
                                GlobePay
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#" className="text-[15px] font-semibold text-white hover:text-[#DDF51A] transition">
                            Money transfers
                        </Link>
                        <Link href="#" className="text-[15px] font-semibold text-white hover:text-[#DDF51A] transition">
                            Large amounts
                        </Link>
                        <Link href="#" className="text-[15px] font-semibold text-white hover:text-[#DDF51A] transition">
                            Receive money
                        </Link>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex items-center space-x-6">
                        {session ? (
                            <Link
                                href="/dashboard"
                                className="bg-[#DDF51A] hover:bg-[#c5dc17] text-[#0A1128] px-6 py-2.5 rounded-full text-[15px] font-bold transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-[15px] font-semibold text-white hover:text-[#DDF51A] transition hidden sm:block"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-[#DDF51A] hover:bg-[#c5dc17] text-[#0A1128] px-6 py-2.5 rounded-full text-[15px] font-bold transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
