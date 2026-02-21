import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch real-time accurate rates from Frankfurter (ECB rates)
        const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR', { cache: 'no-store' });
        const data = await res.json();

        if (data && data.rates && data.rates.INR) {
            const usdToInr = data.rates.INR;
            return NextResponse.json({
                success: true,
                rates: {
                    USD_TO_INR: usdToInr,
                    INR_TO_USD: 1 / usdToInr
                }
            });
        }
        throw new Error("Invalid rate data structure");
    } catch (error) {
        console.error("Failed to fetch live rates from Frankfurter:", error);
        return NextResponse.json({
            success: true,
            rates: { USD_TO_INR: 83.15, INR_TO_USD: 1 / 83.15 }
        });
    }
}
