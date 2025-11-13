import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

// Initialize Firebase Admin
if (!getApps().length) {
    // Validate required environment variables
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error("Missing Firebase Admin credentials. Check your environment variables.");
    }

    app = initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Handle newlines in private key
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
    });
} else {
    app = getApps()[0];
}

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { adminAuth, adminDb };