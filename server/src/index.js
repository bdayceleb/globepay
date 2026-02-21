require('dotenv').config();
const express = require('express');
const cors = require('cors');

const webhooksRouter = require('./routes/webhooks.js');
const adminRouter = require('./routes/admin.js');
const fxEngine = require('./services/fxEngine.js');
const orchestrator = require('./services/orchestrator.js');
const prisma = require('./config/db.js');

const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. System Health
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'globepay-blockchain-engine' });
});

// 2. Client Quoting (Connects to our custom FX Engine)
app.get('/quote', async (req, res) => {
    try {
        const { amount, direction } = req.query;
        if (!amount || !direction) return res.status(400).json({ error: 'Missing amount or direction' });

        const quote = await fxEngine.calculateQuote(parseFloat(amount), direction);
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Orchestration Entry Point (Initiate a transfer)
app.post('/transfer', async (req, res) => {
    try {
        const { userId, direction, sendAmount, fromCountry, toCountry } = req.body;

        // 1. Calculate realistic fees
        const quote = await fxEngine.calculateQuote(sendAmount, direction);

        // 2. Draft the transaction in the DB
        const tx = await prisma.transaction.create({
            data: {
                userId,
                direction,
                fromCountry,
                toCountry,
                sendCurrency: quote.fromCurrency,
                receiveCurrency: quote.toCurrency,
                sendAmount: quote.sendAmount,
                exchangeRate: quote.platformRate, // The marked-up rate we actually apply
                fxSpread: quote.fxSpread,
                serviceFee: quote.serviceFee,
                taxAmount: quote.taxAmount,
                estimatedPayout: quote.estimatedPayout,
                status: 'draft',
            }
        });

        // 3. Push to `initiated` state immediately
        await orchestrator.advanceState(tx.id, 'initiated', {
            ledgerPayload: { initSource: 'client_api' }
        });

        res.json({ success: true, transactionId: tx.id, quote });

    } catch (error) {
        console.error('Transfer Initiation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mount specialized routers
app.use('/', webhooksRouter);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`[Server] 🚀 GlobePay Production Node.js Engine listening on ${PORT}`);
    console.log(`[Server] ENV_MODE: ${process.env.ENV_MODE || 'development'}`);
});
