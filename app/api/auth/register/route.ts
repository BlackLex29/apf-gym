import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, phone, password, role } = body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !password || !role) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Password validation
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Verify role assignment
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rafaelleviste44@gmail.com";
        const OWNER_EMAIL = process.env.OWNER_EMAIL || "marklorenze84@gmail.com";

        let finalRole = "client";
        if (email === ADMIN_EMAIL) {
            finalRole = "admin";
        } else if (email === OWNER_EMAIL) {
            finalRole = "owner";
        }

        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
            emailVerified: false,
        });

        // Store user data in Firestore
        await adminDb.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            firstName,
            lastName,
            email,
            phone,
            role: finalRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            emailVerified: false,
        });

        // Generate and send verification email (Firebase sends it automatically)
        const actionCodeSettings = {
            url: `${process.env.NEXT_PUBLIC_URL || 'https://gymschedpro.vercel.app'}/login`,
            handleCodeInApp: false,
        };

        await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);

        return NextResponse.json(
            {
                success: true,
                message: "Registration successful. Please check your email to verify your account.",
                role: finalRole,
                uid: userRecord.uid,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);

        // Handle specific Firebase errors
        if (error.code === "auth/email-already-exists") {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            );
        }

        if (error.code === "auth/invalid-password") {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Registration failed" },
            { status: 500 }
        );
    }
}

// Resend verification email
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const actionCodeSettings = {
            url: `${process.env.NEXT_PUBLIC_URL || 'https://gymschedpro.vercel.app'}/login`,
            handleCodeInApp: false,
        };

        await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);

        return NextResponse.json(
            {
                success: true,
                message: "Verification email resent successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Resend verification error:", error);

        if (error.code === "auth/user-not-found") {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Failed to resend verification email" },
            { status: 500 }
        );
    }
}