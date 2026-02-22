import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await db.findUserById(session.userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        let linkedBanks = user.linkedBanks || [];
        let needsUpdate = false;
        linkedBanks = linkedBanks.map(b => {
            if (b.mockBalance === undefined || b.mockBalance === null) {
                needsUpdate = true;
                return { ...b, mockBalance: Math.floor(800000 + Math.random() * 1200000) };
            }
            return b;
        });

        if (needsUpdate) {
            await db.updateUser(user.id, { linkedBanks });
        }

        return NextResponse.json({
            success: true,
            fiatBalance: user.fiatBalance || 0,
            linkedBanks: linkedBanks,
            countryCode: user.countryCode || '+91'
        });
    } catch (error) {
        console.error("Fetch Funding Data Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { action, payload } = await request.json();
        const user = await db.findUserById(session.userId);

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (action === 'ADD_BANK') {
            const currentBanks = user.linkedBanks || [];
            const newBanks = [...currentBanks, payload];
            await db.updateUser(user.id, { linkedBanks: newBanks });
            return NextResponse.json({ success: true, linkedBanks: newBanks });
        }

        if (action === 'REMOVE_BANK') {
            const currentBanks = user.linkedBanks || [];
            const newBanks = currentBanks.filter(b => b.id !== payload.id);
            await db.updateUser(user.id, { linkedBanks: newBanks });
            return NextResponse.json({ success: true, linkedBanks: newBanks });
        }

        if (action === 'ADD_FUNDS') {
            const currentBalance = user.fiatBalance || 0;
            const newBalance = currentBalance + Number(payload.amount);
            await db.updateUser(user.id, { fiatBalance: newBalance });
            return NextResponse.json({ success: true, fiatBalance: newBalance });
        }

        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

    } catch (error) {
        console.error("Update Funding Data Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
