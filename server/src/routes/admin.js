const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

/**
 * GET /admin/transactions
 * Fetch all transactions for the admin dashboard.
 */
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /admin/transaction/:id
 * Fetch a specific transaction.
 */
router.get('/transaction/:id', async (req, res) => {
    try {
        const tx = await prisma.transaction.findUnique({
            where: { id: req.params.id },
            include: { user: true, complianceRecord: true, ledgerEvents: true }
        });

        if (!tx) return res.status(404).json({ error: 'Transaction not found' });

        res.json(tx);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /transaction/:id/audit
 * PITCH-READY ENDPOINT
 * Returns the full transparent payload required to prove blockchain provenance and fee margins.
 */
router.get('/transaction/:id/audit', async (req, res) => {
    try {
        const tx = await prisma.transaction.findUnique({
            where: { id: req.params.id },
            include: { ledgerEvents: { orderBy: { timestamp: 'asc' } }, complianceRecord: true }
        });

        if (!tx) return res.status(404).json({ error: 'Transaction not found' });

        // Calculate actual margin (Platform diff vs mid-market if it were calculated dynamically, 
        // here we just recalculate the stored spread value for demo)
        const platformValue = tx.sendAmount * tx.exchangeRate;
        const marginEarned = platformValue * tx.fxSpread + tx.serviceFee;

        const auditTrail = {
            tx_id: tx.id,
            blockchain_tx: tx.blockchainTxHash || 'Pending',
            explorer_url: tx.blockchainTxHash ? `https://explorer.solana.com/tx/${tx.blockchainTxHash}?cluster=devnet` : null,
            memo_hash: tx.blockchainMemoHash || 'Pending',
            block_time: tx.updatedAt,
            fx_details: {
                direction: tx.direction,
                send_amount: tx.sendAmount,
                platform_rate: tx.exchangeRate,
                fx_spread_bps: tx.fxSpread * 10000,
            },
            fees: {
                service_fee: tx.serviceFee,
                tax_amount: tx.taxAmount,
            },
            margin_earned: marginEarned,
            compliance: tx.complianceRecord ? {
                purpose_code: tx.complianceRecord.purposeCode,
                status: tx.complianceRecord.sanctionsCheckStatus,
                risk_score: tx.complianceRecord.riskScore
            } : 'Pending',
            lifecycle_events: tx.ledgerEvents.map(e => ({
                event: e.eventType,
                metadata: JSON.parse(e.metadataJson),
                timestamp: e.timestamp
            }))
        };

        res.json(auditTrail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
