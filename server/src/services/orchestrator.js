const prisma = require('../config/db');
const LedgerLogger = require('./ledgerLogger');
const BlockchainService = require('./blockchain');
const firebaseService = require('./firebase');

class TransactionOrchestrator {
    constructor() {
        this.START_STATE = 'draft';
        this.END_STATE = 'completed';

        // Strict allowed transitions
        this.VALID_TRANSITIONS = {
            'draft': ['initiated'],
            'initiated': ['funded'],
            'funded': ['converted_to_usdc'],
            'converted_to_usdc': ['broadcasted_to_solana'],
            'broadcasted_to_solana': ['confirmed_on_chain'],
            'confirmed_on_chain': ['off_ramp_processing'],
            'off_ramp_processing': ['completed'],
            'completed': [] // Terminal state
        };
    }

    /**
     * Pushes a transaction ID to the next logical state if valid.
     */
    async advanceState(transactionId, targetState, eventMetadata = {}) {
        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { complianceRecord: true, user: true }
        });

        if (!tx) throw new Error('Transaction not found');

        const allowedNextStates = this.VALID_TRANSITIONS[tx.status];
        if (!allowedNextStates.includes(targetState)) {
            throw new Error(`Invalid state transition: ${tx.status} -> ${targetState}`);
        }

        // 1. Update the database
        const updatedTx = await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: targetState, ...eventMetadata.dbUpdates }
        });

        // 1b. Sync state out to Firebase for the live Pitch UI Dashboard
        await firebaseService.syncTransactionToFirebase(updatedTx);

        // 2. Insert ledger event
        await LedgerLogger.logEvent(transactionId, `TRANSITION_TO_${targetState.toUpperCase()}`, {
            previousState: tx.status,
            newState: targetState,
            ...eventMetadata.ledgerPayload
        });

        // 3. Trigger side-effects based on the new state
        this._handleSideEffects(updatedTx, targetState);

        return updatedTx;
    }

    /**
     * Background processing that runs after a state change is committed.
     * In production, this drops the job onto BullMQ. For the demo, we run it asynchronously.
     */
    async _handleSideEffects(tx, state) {
        if (state === 'funded') {
            console.log(`[Orchestrator] TX ${tx.id} funded. Generating USDC Conversion Event.`);
            // Simulate 500ms delay to make the terminal logs look authentic during pitch
            setTimeout(() => this.advanceState(tx.id, 'converted_to_usdc'), 500);
        }

        if (state === 'converted_to_usdc') {
            console.log(`[Orchestrator] TX ${tx.id} converted. Hashing memo and dispatching to Solana.`);

            // Build the memo hash payload
            const memoHash = BlockchainService.generateMemoHash(
                tx.id,
                tx.user ? (tx.user.kycHash || 'unverified') : 'unverified',
                tx.direction,
                tx.exchangeRate
            );

            // Broadcast to devnet (or simulate heavily)
            try {
                // Determine dummy destination wallet
                const destAddress = '8X5WeAx5p26EBSB3m2X2ZtdzBXV4mRkmb9L1rY2Qp1nN';

                const onChainResult = await BlockchainService.simulateUsdcTransfer(
                    tx.sendAmount, // Using flat amount for demo
                    destAddress,
                    memoHash
                );

                await this.advanceState(tx.id, 'broadcasted_to_solana', {
                    dbUpdates: {
                        blockchainTxHash: onChainResult.signature,
                        blockchainMemoHash: memoHash
                    },
                    ledgerPayload: {
                        memoHash,
                        explorerUrl: onChainResult.explorerUrl,
                        blockHeight: onChainResult.blockHeight
                    }
                });

                // Auto-progress to confirmed for speed in demo
                setTimeout(() => this.advanceState(tx.id, 'confirmed_on_chain'), 1000);

            } catch (err) {
                console.error(`[Orchestrator] Onchain failure for TX ${tx.id}`, err);
            }
        }
    }
}

module.exports = new TransactionOrchestrator();
