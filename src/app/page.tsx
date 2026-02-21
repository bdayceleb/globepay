import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { GlobalAccountSection } from '@/components/landing/GlobalAccountSection';
import { DebitCardSection } from '@/components/landing/DebitCardSection';
import { BusinessSection } from '@/components/landing/BusinessSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-white antialiased overflow-x-hidden">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <GlobalAccountSection />
            <DebitCardSection />
            <BusinessSection />
            <HowItWorks />
            <Footer />
        </main>
    );
}
