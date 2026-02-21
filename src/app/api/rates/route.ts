import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch real-time rates (using a free open API for the prototype)
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();

        if (data && data.rates && data.rates.INR) {
            return NextResponse.json({
                success: true,
                rates: {
                    USD_TO_INR: data.rates.INR,
                    INR_TO_USD: 1 / data.rates.INR
                }
            });
        }

        throw new Error("Invalid rate data");
    } catch (error) {
        console.error("Failed to fetch live rates:", error);
        // Fallback rates if the API fails
        return NextResponse.json({
            success: true,
            rates: {
                USD_TO_INR: 83.15,
                INR_TO_USD: 0.0120
            }
        });
    }
}
