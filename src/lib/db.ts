import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

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
    email: string;
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
        try {
            const q = query(collection(firestore, 'users'), where('email', '==', email));
            const qs = await getDocs(q);
            if (qs.empty) return undefined;
            return qs.docs[0].data() as User;
        } catch (e) {
            console.error("Firestore error:", e);
            return undefined;
        }
    },

    findUserById: async (id: string): Promise<User | undefined> => {
        try {
            const docSnap = await getDoc(doc(firestore, 'users', id));
            if (!docSnap.exists()) return undefined;
            return docSnap.data() as User;
        } catch (e) {
            console.error("Firestore error:", e);
            return undefined;
        }
    },

    addUser: async (user: User): Promise<void> => {
        try {
            await setDoc(doc(firestore, 'users', user.id), user);
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
