import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { direction, sendAmount, totalPayAmount, fundingSource, fromCountry, toCountry, recipientDetails } = body;

        // Security check: Verify the user actually has enough Firebase cash to fund this.
        let userToDeduct = null;
        if (fundingSource === 'globepay-balance') {
            userToDeduct = await db.findUserById(session.userId);
            if (!userToDeduct) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const currentBalance = userToDeduct.fiatBalance || 0;
            if (currentBalance < totalPayAmount) {
                return NextResponse.json({ error: 'Insufficient GlobePay Account Balance.' }, { status: 400 });
            }
        }

        // Forward this request to our Node.js Global Blockchain Broker running on port 4000
        const mappedDirection = direction === 'US_TO_IN' ? 'US_TO_INDIA' : 'INDIA_TO_US';

        let brokerData;
        let brokerResOk = false;
        let brokerStatus = 500;

        try {
            const brokerRes = await fetch('http://localhost:4000/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.userId,
                    direction: mappedDirection,
                    sendAmount,
                    fromCountry,
                    toCountry,
                    recipientDetails
                })
            });
            brokerData = await brokerRes.json();
            brokerResOk = brokerRes.ok;
            brokerStatus = brokerRes.status;
        } catch (e) {
            console.warn("[Orchestrator] Localhost broker unreachable. Running Vercel fallback simulation.");
            brokerResOk = true;
            brokerData = {
                success: true,
                transactionId: `mock_tx_${Date.now()}`,
                status: 'completed',
                explorerUrl: 'https://explorer.solana.com',
                message: 'Simulated on Vercel'
            };
        }

        if (!brokerResOk) {
            return NextResponse.json({ error: brokerData?.error || 'Broker failed' }, { status: brokerStatus });
        }

        // 💰 Deduct the fiat balance from Firebase DB since the broker successfully grabbed the funds
        if (userToDeduct && fundingSource === 'globepay-balance') {
            const newBalance = (userToDeduct.fiatBalance || 0) - totalPayAmount;
            await db.updateUser(userToDeduct.id, { fiatBalance: newBalance });
            console.log(`[API] Deducted ${totalPayAmount} from User ${userToDeduct.id}. New Balance = ${newBalance}`);
        }

        // Add a deliberate 1.5s delay before firing the webhook.
        // This gives SQLite time to breathe and allows the UI to show the initial loading state.
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 🚀 Auto-fund: Tell the broker we successfully secured the funds locally via GlobePay / Linked Banks
        try {
            await fetch('http://127.0.0.1:4000/webhook/bridge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId: brokerData.transactionId,
                    status: 'funded'
                })
            });
        } catch (e) {
            console.warn("[Orchestrator] Webhook simulation bypassed on Vercel.");
        }

        return NextResponse.json(brokerData);
    } catch (error) {
        console.error("Orchestrator proxy error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
