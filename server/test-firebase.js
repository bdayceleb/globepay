const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyBVeZHjR_TRgK9ZMNa1YOllwDUJY_1OB88",
    projectId: "globepay-c6f90"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function run() {
    const qs = await getDocs(collection(firestore, 'transactions'));
    console.log(`Found ${qs.size} transactions in Firebase.`);
    qs.forEach(doc => {
        if (doc.id.length > 20) {
            console.log(doc.id, doc.data().status, doc.data().blockchainMemoHash);
        }
    });
    process.exit(0);
}
run();
