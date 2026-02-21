import { NextResponse } from 'next/server';

const TRANSFI_API_KEY = process.env.TRANSFI_API_KEY;
const TRANSFI_SECRET_KEY = process.env.TRANSFI_SECRET_KEY;

export async function POST(request: Request) {
    try {
        const { amountUsdc, upiId, recipientName, purposeCode } = await request.json();

        // ----------------------------------------------------------------------------------
        // PRODUCTION ARCHITECTURE (PLAN A)
        // This is the RBI AD-II gateway. It takes the USDC, converts to INR, and executes
        // an IMPS/UPI payout via local partner banking rails while generating an e-FIRC.
        // ----------------------------------------------------------------------------------
        if (TRANSFI_API_KEY && TRANSFI_SECRET_KEY) {
            console.log(`[TRANSFI AD-II] Initiating Payout to ${upiId} for ${amountUsdc} USDC`);

            // 1. Request an immediate quote and lock the USDC/INR rate for payout
            const quoteRes = await fetch('https://api.transfi.com/v1/payouts/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TRANSFI_API_KEY}`
                },
                body: JSON.stringify({
                    crypto_currency: 'USDC',
                    fiat_currency: 'INR',
                    amount: amountUsdc
                })
            });
            const quote = await quoteRes.json();

            // 2. Execute the INR Transfer to the recipient's UPI
            const payoutRes = await fetch('https://api.transfi.com/v1/payouts/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TRANSFI_API_KEY}`
                },
                body: JSON.stringify({
                    quote_id: quote.id,
                    recipient: {
                        name: recipientName,
                        upi_id: upiId,
                        // Mandatory for Indian compliance
                        purpose_code: purposeCode || 'P0103' // Default to Family Maintenance
                    }
                })
            });

            if (!payoutRes.ok) {
                const errorData = await payoutRes.json();
                throw new Error(errorData.message || 'TransFi Payout Error');
            }

            const payout = await payoutRes.json();

            return NextResponse.json({
                success: true,
                live_payout: true,
                payout_id: payout.id,
                fiat_delivered: quote.fiat_amount,
                tracking_url: payout.tracking_url,
                status: payout.status // Expected: 'PROCESSING' or 'DELIVERED'
            });
        }

        // --- FALLBACK MOCK FOR INVESTOR PITCH ---
        console.log(`[TRANSFI MOCK] Instructing local partner to release INR to ${upiId}`);

        // Artificial settlement delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockBankRef = "SBIN" + Math.floor(Math.random() * 10000000000);

        return NextResponse.json({
            success: true,
            live_payout: false,
            payout_id: `mock_payout_${Date.now()}`,
            fiat_delivered: (parseFloat(amountUsdc) * 82.50).toFixed(2),
            tracking_url: `https://mock.transfi.com/track/${mockBankRef}`,
            status: 'DELIVERED',
            bankReference: mockBankRef
        });

    } catch (error) {
        console.error("[TRANSFI PAYOUT API ERROR]", error);
        return NextResponse.json({ success: false, error: 'Failed to execute India payout' }, { status: 500 });
    }
}
