import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        // Generate a simple ID
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

        const newUser = {
            id,
            email,
            passwordHash,
            isKycComplete: false
        };

        await db.addUser(newUser);
        await createSession(newUser.id);

        return NextResponse.json({ success: true, user: { id, email, isKycComplete: false } });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
