const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyBVeZHjR_TRgK9ZMNa1YOllwDUJY_1OB88",
    appId: "1:664273233284:web:992e0f1f3c01767ad769d1",
    messagingSenderId: "664273233284",
    projectId: "globepay-c6f90",
    authDomain: "globepay-c6f90.firebaseapp.com",
    storageBucket: "globepay-c6f90.firebasestorage.app",
    measurementId: "G-17NLJRJCL5",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

const syncTransactionToFirebase = async (tx) => {
    try {
        if (!tx.id) return;

        // We push the full transaction payload to Firestore mapped to the Next.js `TransactionDraft` schema
        const payload = {
            id: tx.id,
            userId: tx.userId,
            fromCountry: tx.fromCountry,
            toCountry: tx.toCountry,
            sendCurrency: tx.sendCurrency,
            receiveCurrency: tx.receiveCurrency,
            sendAmount: tx.sendAmount,
            exchangeRate: tx.exchangeRate,
            fxSpread: tx.fxSpread,
            serviceFee: tx.serviceFee,
            taxAmount: tx.taxAmount,
            estimatedPayout: tx.estimatedPayout,
            status: tx.status,
            updatedAt: tx.updatedAt ? new Date(tx.updatedAt).getTime() : Date.now(),
            createdAt: tx.createdAt ? new Date(tx.createdAt).getTime() : Date.now(),
            blockchainTxHash: tx.blockchainTxHash || null,
            blockchainMemoHash: tx.blockchainMemoHash || null
        };

        await setDoc(doc(firestore, 'transactions', tx.id), payload, { merge: true });
        console.log(`[Firebase Sync] Pulled TX ${tx.id} state to Firestore: ${tx.status}`);
    } catch (e) {
        console.error('[Firebase Sync Error]', e);
    }
};

module.exports = {
    syncTransactionToFirebase
};
