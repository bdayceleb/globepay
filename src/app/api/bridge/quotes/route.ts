import { NextResponse } from 'next/server';

const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY;

export async function POST(request: Request) {
    try {
        const { amount, sourceCurrency, targetCurrency } = await request.json();

        // ----------------------------------------------------------------------------------
        // PRODUCTION ARCHITECTURE (PLAN A)
        // If the Bridge API Key is present, we call the live Bridge Sandbox.
        // If not, we gracefully fallback to the mock for the investor pitch.
        // ----------------------------------------------------------------------------------
        if (BRIDGE_API_KEY) {
            console.log(`[BRIDGE API] Fetching live quote for ${amount} ${sourceCurrency} to ${targetCurrency}`);

            const response = await fetch('https://api.bridge.xyz/v0/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${BRIDGE_API_KEY}`
                },
                body: JSON.stringify({
                    source_amount: amount.toString(),
                    source_currency: sourceCurrency.toLowerCase(),
                    destination_currency: targetCurrency.toLowerCase()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Bridge API Error');
            }

            const quote = await response.json();
            return NextResponse.json({
                success: true,
                live_quote: true,
                amount_out: quote.destination_amount,
                fee: quote.fee,
                rate: quote.exchange_rate,
                quote_id: quote.id
            });
        }

        // --- FALLBACK MOCK FOR INVESTOR PITCH ---
        console.log(`[MOCK] Providing simulated quote for ${amount} ${sourceCurrency} to ${targetCurrency}`);

        // Simulated fixed exchange rate for USD to INR
        const mockRate = 82.50;
        const mockFee = 0.00; // Zero fees for GlobePay!

        return NextResponse.json({
            success: true,
            live_quote: false,
            amount_out: (parseFloat(amount) - mockFee) * mockRate,
            fee: mockFee,
            rate: mockRate,
            quote_id: `mock_quote_${Date.now()}`
        });

    } catch (error) {
        console.error("[BRIDGE QUOTE API ERROR]", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch quote' }, { status: 500 });
    }
}
