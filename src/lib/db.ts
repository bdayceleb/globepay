import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { encryptData, decryptData } from '@/lib/encryption';

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

export interface User {
    id: string;
    email: string; // Stored encrypted
    phone?: string; // Stored encrypted
    countryCode?: string;
    passwordHash: string;
    kycData?: any; // Dynamic storage for Country-Specific identity documents
    isKycComplete: boolean;
    kycDetails?: {
        aadharCard: string;
        panCard: string;
        fullName: string;
    };
    fiatBalance: number;
    linkedBanks: {
        id: string;
        bankName: string;
        icon: string;
        accountNumber: string; // Stored encrypted
        ifscCode: string; // Stored as plain text (public routing info)
        mockBalance?: number;
    }[];
}

export interface TransactionDraft {
    id: string;
    userId: string;
    fromCountry: string;
    toCountry: string;
    sendCurrency: string;
    receiveCurrency: string;
    sendAmount: number;
    exchangeRate: number;
    fxSpread: number;
    serviceFee: number;
    taxAmount: number;
    estimatedPayout: number;
    complianceFields?: {
        purposeCode?: string;
        lrsDeclaration?: boolean;
    };
    recipientDetails?: {
        name?: string;
        accountNumber?: string;
        ifscCode?: string;
        routingNumber?: string;
    };
    status: 'draft' | 'initiated' | 'funded' | 'converted' | 'completed' | 'failed';
    updatedAt: number;
    createdAt: number;
}

export const db = {
    findUserByEmail: async (email: string): Promise<User | undefined> => {
        console.log(`[DB] Looking up user by email: ${email}`);

        try {
            // For a secure, encrypted database, we cannot standard query by email because AES
            // generates unique ciphertexts (random salts). In a production app, we would use a
            // "Blind Index" (like a SHA-256 hash of the email) to query. For the scope of this
            // prototype, we fetch and decrypt the user records into memory to find the match.
            const qs = await getDocs(collection(firestore, 'users'));
            console.log(`[DB] Scanning ${qs.size} encrypted users...`);

            let matchedUser: User | undefined;

            qs.forEach((docSnap) => {
                if (matchedUser) return; // Exit if already found

                const rawUser = docSnap.data() as User;
                const decryptedEmail = decryptData(rawUser.email);

                if (decryptedEmail.toLowerCase() === email.toLowerCase()) {
                    matchedUser = {
                        ...rawUser,
                        email: decryptedEmail,
                        phone: rawUser.phone ? decryptData(rawUser.phone) : undefined,
                        countryCode: rawUser.countryCode,
                        kycData: rawUser.kycData,
                        fiatBalance: rawUser.fiatBalance || 0,
                        linkedBanks: (rawUser.linkedBanks || []).map(bank => ({
                            ...bank,
                            accountNumber: decryptData(bank.accountNumber)
                        }))
                    };
                }
            });

            if (!matchedUser) {
                console.log(`[DB] No matching user found for email.`);
            }

            return matchedUser;
        } catch (e) {
            console.error("Firestore error:", e);
            return undefined;
        }
    },

    findUserById: async (id: string): Promise<User | undefined> => {
        try {
            const docSnap = await getDoc(doc(firestore, 'users', id));
            if (!docSnap.exists()) return undefined;

            const rawUser = docSnap.data() as User;
            return {
                ...rawUser,
                email: decryptData(rawUser.email),
                phone: rawUser.phone ? decryptData(rawUser.phone) : undefined,
                countryCode: rawUser.countryCode,
                kycData: rawUser.kycData,
                fiatBalance: rawUser.fiatBalance || 0,
                linkedBanks: (rawUser.linkedBanks || []).map(bank => ({
                    ...bank,
                    accountNumber: decryptData(bank.accountNumber)
                }))
            };
        } catch (e) {
            console.error("Firestore error:", e);
            return undefined;
        }
    },

    findUserByAccountNumber: async (accountNumber: string): Promise<User | undefined> => {
        try {
            const qs = await getDocs(collection(firestore, 'users'));
            let matchedUser: User | undefined;

            qs.forEach((docSnap) => {
                if (matchedUser) return;
                const rawUser = docSnap.data() as User;
                if (!rawUser.linkedBanks) return;

                for (const bank of rawUser.linkedBanks) {
                    const decryptedAccount = decryptData(bank.accountNumber);
                    if (decryptedAccount === accountNumber) {
                        matchedUser = {
                            ...rawUser,
                            email: decryptData(rawUser.email),
                            phone: rawUser.phone ? decryptData(rawUser.phone) : undefined,
                            countryCode: rawUser.countryCode,
                            kycData: rawUser.kycData,
                            fiatBalance: rawUser.fiatBalance || 0,
                            linkedBanks: rawUser.linkedBanks.map(b => ({
                                ...b,
                                accountNumber: decryptData(b.accountNumber)
                            }))
                        };
                        break;
                    }
                }
            });
            return matchedUser;
        } catch (e) {
            console.error("Firestore error:", e);
            return undefined;
        }
    },

    addUser: async (user: User): Promise<void> => {
        console.log(`[DB] Adding new user: ${user.email} (${user.id})`);

        // 🚨 CRITICAL: Encrypt all PII before it leaves the backend
        const encryptedUser: User = {
            ...user,
            email: encryptData(user.email),
            phone: user.phone ? encryptData(user.phone) : undefined,
            fiatBalance: user.fiatBalance || 0,
            linkedBanks: (user.linkedBanks || []).map(bank => ({
                ...bank,
                accountNumber: encryptData(bank.accountNumber)
            }))
        };

        try {
            await setDoc(doc(firestore, 'users', user.id), encryptedUser);
            console.log(`[DB] User added successfully (Encrypted)`);
        } catch (e) {
            console.error("Firestore error writing user:", e);
            throw e;
        }
    },

    updateUser: async (id: string, updates: Partial<User>): Promise<void> => {
        try {
            // Need to encrypt arrays if they are being updated directly
            let safeUpdates = { ...updates };

            if (updates.linkedBanks) {
                safeUpdates.linkedBanks = updates.linkedBanks.map(bank => ({
                    ...bank,
                    accountNumber: encryptData(bank.accountNumber)
                }));
            }

            await updateDoc(doc(firestore, 'users', id), safeUpdates);
        } catch (e) {
            console.error("Firestore error updating user:", e);
            throw e;
        }
    },

    saveDraft: async (draft: TransactionDraft): Promise<void> => {
        try {
            await setDoc(doc(firestore, 'transactions', draft.id), draft);
        } catch (e) {
            console.error("Firestore error saving draft:", e);
            throw e;
        }
    },

    getUserDrafts: async (userId: string): Promise<TransactionDraft[]> => {
        try {
            const q = query(collection(firestore, 'transactions'), where('userId', '==', userId));
            const qs = await getDocs(q);
            const transactions: TransactionDraft[] = [];
            qs.forEach((docSnap) => {
                const data = docSnap.data() as TransactionDraft;
                // Strict Firebase Filter: Completely ignore any legacy 'draft' entries so the UI stays clean.
                if (data.status !== 'draft') {
                    transactions.push(data);
                }
            });
            // Sort by createdAt descending
            transactions.sort((a, b) => b.createdAt - a.createdAt);
            return transactions;
        } catch (e) {
            console.error("Firestore error getting drafts:", e);
            return [];
        }
    }
};
