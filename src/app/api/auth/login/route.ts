import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const user = await db.findUserByEmail(email);
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = bcrypt.compareSync(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        await createSession(user.id);
        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, isKycComplete: user.isKycComplete } });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
