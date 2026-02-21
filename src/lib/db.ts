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
    passwordHash: string;
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
    }[];
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
                        ...(rawUser.kycDetails && {
                            kycDetails: {
                                aadharCard: decryptData(rawUser.kycDetails.aadharCard),
                                panCard: decryptData(rawUser.kycDetails.panCard),
                                fullName: decryptData(rawUser.kycDetails.fullName),
                            }
                        }),
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
                ...(rawUser.kycDetails && {
                    kycDetails: {
                        aadharCard: decryptData(rawUser.kycDetails.aadharCard),
                        panCard: decryptData(rawUser.kycDetails.panCard),
                        fullName: decryptData(rawUser.kycDetails.fullName),
                    }
                }),
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
    }
};
