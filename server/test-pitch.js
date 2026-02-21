const process = require('process');
const crypto = require('crypto');

async function run() {
    console.log("🚀 [PITCH SIMULATION] Initializing User Data...");

    // We need to insert a fake user directly into DB so the FK constraints pass
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // 1. Create a dummy user
    try {
        const user = await prisma.user.upsert({
            where: { email: 'investor@globepay.test' },
            create: {
                id: 'demo-user-1',
                name: 'Demo Investor',
                email: 'investor@globepay.test',
                passwordHash: 'dummy',
                country: 'US',
                kycStatus: 'VERIFIED',
                kycHash: crypto.createHash('sha256').update('DEMO_KYC_ID').digest('hex'),
                fiatBalance: 50000.0,
            },
            update: {}
        });
        console.log("✅ User created.");
    } catch (e) {
        console.log("User might already exist, proceeding...");
    }

    // Wait for the backend express server to be ready
    await new Promise(r => setTimeout(r, 2000));

    // 2. Trigger the transfer via our Express entrypoint
    console.log("Firing Initiation Payload to /transfer API...");
    const transferRes = await fetch('http://localhost:4000/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: 'demo-user-1',
            direction: 'US_TO_INDIA',
            sendAmount: 1000,
            fromCountry: 'US',
            toCountry: 'IN'
        })
    });
    const transferData = await transferRes.json();
    console.log(`✅ Transfer Initiated! \n   ID: ${transferData.transactionId}\n   Fx Spread Applied: ${transferData.quote.fxSpread}`);

    console.log("\n⏳ Waiting 2 seconds for Bridge Webhook simulated payload...");
    await new Promise(r => setTimeout(r, 2000));

    // 3. Trigger Bridge deposit webhook
    const webhookRes = await fetch('http://localhost:4000/webhook/bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            transactionId: transferData.transactionId,
            status: 'funded'
        })
    });
    console.log('✅ Bridge Webhook: ', await webhookRes.json());

    // Allow orchestrator async events to settle (on-chain broadcast)
    console.log("⏳ Giving Orchestrator 3 seconds to generate Devnet txs...");
    await new Promise(r => setTimeout(r, 3000));

    // 4. Fetch the final Audit payload
    console.log("\n🔍 Retrieving final Immutable Audit Payload for Pitch Screen:");
    const auditRes = await fetch(`http://localhost:4000/admin/transaction/${transferData.transactionId}/audit`);
    const auditData = await auditRes.json();

    console.log(JSON.stringify(auditData, null, 2));

    process.exit(0);
}

run();
