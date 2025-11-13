import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Get user by email to verify existence
        let userRecord;
        try {
            userRecord = await adminAuth.getUserByEmail(email);
        } catch (error: any) {
            if (error.code === "auth/user-not-found") {
                return NextResponse.json(
                    { error: "Invalid email or password" },
                    { status: 401 }
                );
            }
            throw error;
        }

        // Check if email is verified
        if (!userRecord.emailVerified) {
            return NextResponse.json(
                { error: "Please verify your email before logging in" },
                { status: 403 }
            );
        }

        // Get user data from Firestore
        const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { error: "User data not found" },
                { status: 404 }
            );
        }

        const userData = userDoc.data();

        // Verify role assignment
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rafaelleviste44@gmail.com";
        const OWNER_EMAIL = process.env.OWNER_EMAIL || "marklorenze84@gmail.com";

        let finalRole = "client";
        if (email === ADMIN_EMAIL) {
            finalRole = "admin";
        } else if (email === OWNER_EMAIL) {
            finalRole = "owner";
        }

        // Update role if it doesn't match
        if (userData?.role !== finalRole) {
            await adminDb.collection("users").doc(userRecord.uid).update({
                role: finalRole,
                updatedAt: new Date().toISOString(),
            });
        }

        // Create custom token for client-side authentication
        const customToken = await adminAuth.createCustomToken(userRecord.uid);

        return NextResponse.json(
            {
                success: true,
                message: "Login successful",
                token: customToken,
                user: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    role: finalRole,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Login error:", error);

        return NextResponse.json(
            { error: error.message || "Login failed" },
            { status: 500 }
        );
    }
}