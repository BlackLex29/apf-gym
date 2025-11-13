import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as dotenv from 'dotenv';
dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase credentials. Check .env file.");
}

initializeApp({
    credential: cert({
        projectId,
        clientEmail,
        privateKey,
    }),
});

async function enableTOTP() {
    try {
        await getAuth().projectConfigManager().updateProjectConfig({
            multiFactorConfig: {
                state: "ENABLED",
                providerConfigs: [
                    {
                        state: "ENABLED",
                        totpProviderConfig: {
                            adjacentIntervals: 5,
                        },
                    },
                ],
            },
        });
        console.log("TOTP MFA enabled successfully!");
    } catch (error: any) {
        console.error("Failed to enable TOTP:", error.message);
    }
}

enableTOTP();