import { NextResponse } from 'next/server';

const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY;

export async function POST(request: Request) {
    try {
        const { userId, email, fullName } = await request.json();

        // ----------------------------------------------------------------------------------
        // PRODUCTION ARCHITECTURE (PLAN A)
        // This provisions a Virtual ACH Account at a US Bank (e.g., Cross River) via Bridge.
        // ----------------------------------------------------------------------------------
        if (BRIDGE_API_KEY) {
            console.log(`[BRIDGE API] Provisioning Virtual Account for User: ${userId}`);

            // 1. Create a customer in Bridge
            const customerRes = await fetch('https://api.bridge.xyz/v0/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${BRIDGE_API_KEY}`
                },
                body: JSON.stringify({
                    type: 'individual',
                    first_name: fullName.split(' ')[0],
                    last_name: fullName.split(' ')[1] || '',
                    email: email
                })
            });
            const customer = await customerRes.json();

            // 2. Generate a virtual account for that customer
            const accountRes = await fetch(`https://api.bridge.xyz/v0/customers/${customer.id}/virtual_accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${BRIDGE_API_KEY}`
                },
                body: JSON.stringify({
                    currency: 'usd'
                })
            });
            const account = await accountRes.json();

            return NextResponse.json({
                success: true,
                live_account: true,
                accountId: account.id,
                routingNumber: account.routing_number,
                accountNumber: account.account_number,
                bankName: account.bank_name
            });
        }

        // --- FALLBACK MOCK FOR INVESTOR PITCH ---
        console.log(`[MOCK] Generating simulated Virtual Account for User: ${userId}`);

        return NextResponse.json({
            success: true,
            live_account: false,
            accountId: `mock_vir_acc_${Date.now()}`,
            routingNumber: "122000248", // Mock NY Routing
            accountNumber: "88" + Math.floor(Math.random() * 100000000),
            bankName: "Cross River Bank (Mock)"
        });

    } catch (error) {
        console.error("[BRIDGE ACCOUNT API ERROR]", error);
        return NextResponse.json({ success: false, error: 'Failed to provision virtual account' }, { status: 500 });
    }
}
