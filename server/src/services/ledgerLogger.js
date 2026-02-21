const prisma = require('../config/db');

class LedgerLogger {
    /**
     * Records an immutable event in the ledger.
     */
    async logEvent(transactionId, eventType, metadata) {
        try {
            await prisma.ledgerEvent.create({
                data: {
                    transactionId,
                    eventType,
                    metadataJson: JSON.stringify(metadata)
                }
            });
            console.log(`[Ledger] ✅ ${eventType} for TX: ${transactionId}`);
        } catch (error) {
            console.error('[Ledger] 🚨 Failed to log event:', error);
        }
    }
}

module.exports = new LedgerLogger();
