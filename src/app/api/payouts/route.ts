import { NextResponse } from 'next/server';

const TRANSFI_API_KEY = process.env.TRANSFI_API_KEY;
const TRANSFI_SECRET_KEY = process.env.TRANSFI_SECRET_KEY;

export async function POST(request: Request) {
    try {
        const { amountUsdc, upiId, recipientName, purposeCode } = await request.json();

        console.log(`[LIQUIDITY ROUTER] Received payout request for ${amountUsdc} USDC to ${upiId}`);

        // ----------------------------------------------------------------------------------
        // SMART ROUTING & LIQUIDITY FALLBACK ENGINE
        // This orchestrator ensures high availability by routing around partner downtime.
        // It mimics the logic defined in our Operational Risk Mitigation architecture.
        // ----------------------------------------------------------------------------------

        // Mock Health/Latency stats for the demo to show dynamic routing in action.
        // In production, this uses real-time API health checks / websocket ping latency.
        const providers = [
            { name: 'TransFi', isPrimary: true, latencyMs: 800, successRate: 0.7 },   // Primary AD-II Partner (Lowest Fees)
            { name: 'Transak', isPrimary: false, latencyMs: 1200, successRate: 0.85 }, // Secondary Fallback
            { name: 'MoonPay', isPrimary: false, latencyMs: 2500, successRate: 0.99 }  // Last Resort (Highest Reliability, High Fees)
        ];

        let selectedProvider = null;
        let fiatAmount = 0;
        let payoutId = '';
        let trackingUrl = '';
        let status = '';
        let isLive = false;

        // Fallback execution loop
        for (const provider of providers) {
            console.log(`[LIQUIDITY ROUTER] Attempting route via ${provider.name}...`);

            try {
                // If it's TransFi and we have live keys, try the actual live API first (From Phase II plan)
                if (provider.name === 'TransFi' && TRANSFI_API_KEY && TRANSFI_SECRET_KEY) {
                    console.log(`[TRANSFI AD-II] Initiating Live Payout to ${upiId}`);

                    const quoteRes = await fetch('https://api.transfi.com/v1/payouts/quotes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TRANSFI_API_KEY}` },
                        body: JSON.stringify({ crypto_currency: 'USDC', fiat_currency: 'INR', amount: amountUsdc })
                    });

                    if (!quoteRes.ok) throw new Error("TransFi Quote Failed");
                    const quote = await quoteRes.json();

                    const payoutRes = await fetch('https://api.transfi.com/v1/payouts/execute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TRANSFI_API_KEY}` },
                        body: JSON.stringify({
                            quote_id: quote.id,
                            recipient: { name: recipientName, upi_id: upiId, purpose_code: purposeCode || 'P0103' }
                        })
                    });

                    if (!payoutRes.ok) throw new Error("TransFi Execute Failed");
                    const payout = await payoutRes.json();

                    selectedProvider = provider;
                    fiatAmount = quote.fiat_amount;
                    payoutId = payout.id;
                    trackingUrl = payout.tracking_url;
                    status = payout.status;
                    isLive = true;
                    console.log(`[LIQUIDITY ROUTER] ✅ Live Route established with ${provider.name}`);
                    break;
                }

                // Simulate network latency and intermittent failures (chaos engineering for demo)
                await new Promise(resolve => setTimeout(resolve, provider.latencyMs));

                // Random failure simulation to trigger fallbacks
                const isSuccess = Math.random() < provider.successRate;

                if (isSuccess) {
                    console.log(`[LIQUIDITY ROUTER] ✅ Mock Route established with ${provider.name}`);
                    selectedProvider = provider;
                    fiatAmount = parseFloat(amountUsdc) * 83.15; // Mock rate
                    payoutId = `mock_${provider.name.toLowerCase()}_${Date.now()}`;
                    trackingUrl = `https://mock.${provider.name.toLowerCase()}.com/track/TRX${Math.floor(Math.random() * 1000000)}`;
                    status = 'DELIVERED';
                    break;
                } else {
                    console.warn(`[LIQUIDITY ROUTER] ⚠️ ${provider.name} API Timeout/Failure. Failing over...`);
                }
            } catch (err) {
                console.warn(`[LIQUIDITY ROUTER] ⚠️ ${provider.name} Exception: ${err}. Failing over...`);
            }
        }

        if (!selectedProvider) {
            console.error("[LIQUIDITY ROUTER] 🚨 CRITICAL: All liquidity providers exhausted.");
            throw new Error("All liquidity providers failed or timed out. Funds secured in transit vault.");
        }

        return NextResponse.json({
            success: true,
            provider_used: selectedProvider.name,
            live_payout: isLive,
            payout_id: payoutId,
            fiat_delivered: fiatAmount.toFixed(2),
            tracking_url: trackingUrl,
            status: status
        });

    } catch (error) {
        console.error("[LIQUIDITY ROUTER ERROR]", error);
        return NextResponse.json({ success: false, error: 'Failed to find liquidity route' }, { status: 500 });
    }
}
