export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 pt-20 pb-10">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">

                    <div className="flex items-center mb-8 md:mb-0">
                        <img src="/logo.svg" alt="GlobePay Logo" className="w-8 h-8 mr-2" />
                        <span className="text-2xl font-bold tracking-tight text-[#0A1128]">GlobePay</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12">
                        <div className="flex flex-col space-y-4">
                            <span className="font-bold text-[#0A1128]">Company</span>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium">About us</a>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium">Careers</a>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <span className="font-bold text-[#0A1128]">Support</span>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium">Help Centre</a>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium">Mid-market rate</a>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <span className="font-bold text-[#0A1128]">Legal</span>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium">Privacy policy</a>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium">Terms of use</a>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <span className="font-bold text-[#0A1128]">Social</span>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium">Twitter</a>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium">Instagram</a>
                        </div>
                    </div>

                </div>

                <div className="pt-8 border-t border-gray-200">
                    <p className="text-[13px] text-gray-500 max-w-3xl leading-relaxed">
                        © GlobePay Ltd 2026. <br /><br />
                        GlobePay is authorized by the Financial Conduct Authority under the Electronic Money Regulations 2011, Firm Reference 900507, for the issuing of electronic money. Digital asset transfer services are powered by the Solana blockchain. All transactions are simulated in this environment.
                    </p>
                </div>
            </div>
        </footer>
    );
}
