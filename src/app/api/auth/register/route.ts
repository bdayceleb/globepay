import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
    console.log("[API] Registration request received");
    try {
        const { email, phone, password } = await request.json();
        console.log(`[API] Attempting to register email: ${email}`);

        if (!email || !password || !phone) {
            console.log("[API] Missing email, phone, or password");
            return NextResponse.json({ error: 'Email, phone, and password required' }, { status: 400 });
        }

        console.log("[API] Checking if user exists in DB...");
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
            phone,
            passwordHash,
            isKycComplete: false
        };

        console.log("[API] Adding user to DB...");
        await db.addUser(newUser);
        console.log("[API] Creating session...");
        await createSession(newUser.id);

        console.log("[API] Registration successful");
        return NextResponse.json({ success: true, user: { id, email, isKycComplete: false } });
    } catch (error) {
        console.error("[API] Registration error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
