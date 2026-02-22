import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
    console.log("[API] Registration request received");
    try {
        const { email, phone, password, countryCode, kycData } = await request.json();
        console.log(`[API] Attempting to register email: ${email}`);

        if (!email || !password || !phone || !kycData) {
            console.log("[API] Missing required registration fields");
            return NextResponse.json({ error: 'Email, phone, password, and identity documents required' }, { status: 400 });
        }

        console.log("[API] Checking if user exists in DB...");
        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Generate a simple ID
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

        const newUser = {
            id: Date.now().toString(),
            email: email.toLowerCase(),
            phone: phone,
            countryCode: countryCode,
            passwordHash: hashedPassword,
            kycData: kycData,
            isKycComplete: false,
            fiatBalance: 0,
            linkedBanks: []
        };

        console.log("[API] Adding user to DB...");
        await db.addUser(newUser);
        console.log("[API] Creating session...");
        await createSession(newUser.id);

        console.log("[API] Registration successful");
        return NextResponse.json({ success: true, user: { id: newUser.id, email: newUser.email, isKycComplete: false } });
    } catch (error) {
        console.error("[API] Registration error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
