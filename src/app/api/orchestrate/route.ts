import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { direction, sendAmount, fromCountry, toCountry } = body;

        // Forward this request to our Node.js Global Blockchain Broker running on port 4000
        const brokerRes = await fetch('http://localhost:4000/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: session.userId,
                direction,
                sendAmount,
                fromCountry,
                toCountry
            })
        });

        const brokerData = await brokerRes.json();

        if (!brokerRes.ok) {
            return NextResponse.json({ error: brokerData.error || 'Broker failed' }, { status: brokerRes.status });
        }

        return NextResponse.json(brokerData);
    } catch (error) {
        console.error("Orchestrator proxy error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
