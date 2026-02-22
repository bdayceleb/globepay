import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ authenticated: false });
    }

    const user = await db.findUserById(session.userId);
    if (!user) {
        return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
        authenticated: true,
        user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            countryCode: user.countryCode || '+91',
            isKycComplete: user.isKycComplete,
            kycDetails: user.kycDetails,
            fiatBalance: user.fiatBalance
        }
    });
}
