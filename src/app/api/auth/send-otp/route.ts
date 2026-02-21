import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, phone } = await request.json();

        if (!email && !phone) {
            return NextResponse.json({ error: 'Email or phone required' }, { status: 400 });
        }

        // ----------------------------------------------------------------------------------
        // PITCH ARCHITECTURE NOTE:
        // In production, this securely calls Twilio (SMS) and SendGrid (Email).
        // For the investor demo, we simulate a successful send and return a hardcoded OTP.
        // ----------------------------------------------------------------------------------

        console.log(`[OTP MOCK] Simulating OTP send to ${email || phone}...`);

        // Artificial delay to simulate network call to Twilio/SendGrid
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
            mockOtp: '123456' // Hardcoded for demo purposes
        });

    } catch (error) {
        console.error("[OTP MOCK] Error:", error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
