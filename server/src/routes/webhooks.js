const express = require('express');
const router = express.Router();
const orchestrator = require('../services/orchestrator');
const prisma = require('../config/db');

// --- SIMULATED WEBHOOKS ---

/**
 * 1. Bridge Webhook (Deposit Received)
 * Triggered when Fiat is successfully pushed into the user's vACH.
 * This pushes the transaction state from `initiated` -> `funded`.
 */
router.post('/webhook/bridge', async (req, res) => {
    try {
        const { transactionId, status } = req.body;

        if (status === 'funded') {
            await orchestrator.advanceState(transactionId, 'funded', {
                ledgerPayload: { source: 'bridge_webhook' }
            });
            return res.json({ success: true, message: 'Transaction marked funded.' });
        }

        res.status(400).json({ error: 'Unhandled webhook status' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 2. TransFi Webhook (Payout Complete)
 * Triggered when the off-ramp confirms the INR has hit the recipient's bank account.
 * This pushes the transaction state from `off_ramp_processing` -> `completed`.
 */
router.post('/webhook/transfi', async (req, res) => {
    try {
        const { transactionId, status } = req.body;

        if (status === 'payout_complete') {
            await orchestrator.advanceState(transactionId, 'completed', {
                ledgerPayload: { source: 'transfi_webhook' }
            });
            return res.json({ success: true, message: 'Transaction marked completed.' });
        }

        res.status(400).json({ error: 'Unhandled webhook status' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
