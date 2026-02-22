import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fullName, countryCode, kycData } = await request.json();

        // Allow some flexibility since the frontend validates the country-specific subfields
        if (!fullName || !countryCode || !kycData) {
            return NextResponse.json({ error: 'All primary identity fields are required' }, { status: 400 });
        }

        await db.updateUser(session.userId, {
            isKycComplete: true,
            kycData: { fullName, ...kycData }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
