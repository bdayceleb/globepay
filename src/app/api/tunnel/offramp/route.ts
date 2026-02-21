import { NextResponse } from 'next/server';

// Mocking a webhook from TransFi or Stripe Payouts
export async function POST(request: Request) {
    try {
        const { amount, targetCurrency, solanaSignature, recipientId } = await request.json();

        // 1. Simulating the Blockchain Finality Check
        console.log(`[OFFRAMP MOCK] Verifying smart contract receipt: ${solanaSignature}`);

        // 2. Simulating the Local Payout API call (e.g. TransFi POST /v1/payout)
        console.log(`[OFFRAMP MOCK] Instructing local partner to release ${amount} ${targetCurrency} to ${recipientId}`);

        // Artificial delay to represent banking rails processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate a fake UPI/Bank reference number for authenticity
        const mockBankRef = "SBIN" + Math.floor(Math.random() * 10000000000);

        return NextResponse.json({
            success: true,
            status: "DELIVERED",
            message: "Funds successfully delivered to recipient bank account.",
            localBankReference: mockBankRef,
            deliveryTimeSeconds: 2.3
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
