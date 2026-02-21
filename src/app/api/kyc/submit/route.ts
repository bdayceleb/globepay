import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fullName, aadharCard, panCard } = await request.json();

        if (!fullName || !aadharCard || !panCard) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        db.updateUser(session.userId, {
            isKycComplete: true,
            kycDetails: { fullName, aadharCard, panCard }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
