import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { recipientAccount, amount } = await request.json();

        if (!recipientAccount || !amount) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Search for a user whose linked bank matches this account number
        const user = await db.findUserByAccountNumber(recipientAccount);

        if (user) {
            // Found an internal user. Add funds to their GlobePay wallet buffer.
            const newBalance = (user.fiatBalance || 0) + Number(amount);
            await db.updateUser(user.id, { fiatBalance: newBalance });
            console.log(`[Internal Transfer] Auto-Credited ${amount} to GlobePay user: ${user.email}`);
            return NextResponse.json({ success: true, user: user.email, newBalance });
        }

        return NextResponse.json({ success: false, reason: 'No matching user found for this bank account' });

    } catch (error) {
        console.error("Internal Transfer Webhook Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
