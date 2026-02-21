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
}

export const db = {
    findUserByEmail: async (email: string): Promise<User | undefined> => {
        // Because the database is fully encrypted, we must search for the encrypted version of the email.
        const encryptedQueryEmail = encryptData(email);
        console.log(`[DB] Looking up user by encrypted email: ${encryptedQueryEmail}`);

        try {
            const q = query(collection(firestore, 'users'), where('email', '==', encryptedQueryEmail));
            console.log(`[DB] Query created, fetching docs...`);
            const qs = await getDocs(q);
            console.log(`[DB] Query returned ${qs.size} docs`);

            if (qs.empty) return undefined;

            const rawUser = qs.docs[0].data() as User;
            // Return to the application in plaintext
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
                })
            };
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
                })
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
            await updateDoc(doc(firestore, 'users', id), updates);
        } catch (e) {
            console.error("Firestore error updating user:", e);
            throw e;
        }
    }
};
