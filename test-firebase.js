const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyBVeZHjR_TRgK9ZMNa1YOllwDUJY_1OB88",
    appId: "1:664273233284:web:992e0f1f3c01767ad769d1",
    messagingSenderId: "664273233284",
    projectId: "globepay-c6f90",
    authDomain: "globepay-c6f90.firebaseapp.com",
    storageBucket: "globepay-c6f90.firebasestorage.app",
    measurementId: "G-17NLJRJCL5",
};

async function test() {
    console.log("Starting Firebase connectivity test...");
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        console.log("Initialized app and firestore. Fetching users...");

        // Wrap in a promise to handle potential hang
        const fetchPromise = getDocs(collection(db, 'users'));
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout after 10 seconds")), 10000)
        );

        const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
        console.log(`Success! Found ${snapshot.size} users.`);
        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e.message);
        process.exit(1);
    }
}

test();
