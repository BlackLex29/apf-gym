"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dumbbell,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
    signInWithEmailAndPassword,
    getMultiFactorResolver,
    TotpMultiFactorGenerator,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // ← Fixed: import db from same file
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [mfaResolver, setMfaResolver] = useState<any>(null);
    const [totpCode, setTotpCode] = useState("");
    const router = useRouter();

    const handleFirstFactor = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setMfaResolver(null);
        const data = new FormData(e.currentTarget);
        const email = data.get("email") as string;
        const password = data.get("password") as string;
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                await auth.signOut();
                setError("Please verify your email first.");
                setIsLoading(false); // ADD THIS
                return;
            }

            await redirectAfterLogin(user.uid);
        } catch (err: any) {
            if (err.code === "auth/multi-factor-auth-required") {
                const resolver = getMultiFactorResolver(auth, err);
                setMfaResolver(resolver);
                setError(""); // Clear any previous errors
            } else {
                setError(err.message || "Login failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTotpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mfaResolver || totpCode.length !== 6) return;
        setIsLoading(true);
        setError(""); // Clear previous errors

        try {
            const hint = mfaResolver.hints.find(
                (h: any) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID
            );
            if (!hint) throw new Error("TOTP not enrolled");

            const assertion = TotpMultiFactorGenerator.assertionForSignIn(
                hint.uid,
                totpCode
            );

            const userCredential = await mfaResolver.resolveSignIn(assertion);
            await redirectAfterLogin(userCredential.user.uid);
        } catch (err: any) {
            console.error("TOTP verification error:", err); // ADD: Better logging
            const msg = err?.message || "";
            if (msg.includes("INVALID_CODE") || msg.includes("EXPIRED")) {
                setError("Invalid or expired code. Try again.");
            } else {
                setError(err.message || "Verification failed. Please try again.");
            }
            setTotpCode("");
        } finally {
            setIsLoading(false);
        }
    };



    const redirectAfterLogin = async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            const role = userDoc.data()?.role || "client";

            if (role === "admin" || role === "owner") {
                router.push("/a/dashboard");
            } else {
                router.push("/c/dashboard");
            }
        } catch (err) {
            console.error("Failed to fetch user role:", err);
            router.push("/c/dashboard"); // fallback
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted to-orange-900/20 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
                {/* LEFT – branding */}
                <div className="text-center lg:text-left space-y-6">
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                        <div className="p-3 bg-orange-500 rounded-full">
                            <Dumbbell className="h-10 w-10 text-black" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-foreground">GymSchedPro</h1>
                            <p className="text-orange-500 font-semibold">APF Tanauan</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-foreground leading-tight">
                            <span className="text-balance">Welcome back!</span>
                            <br />
                            <span className="text-balance text-orange-500">
                                Train Smarter, Not Harder
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Sign in to book sessions, chat with coaches, and track your progress.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/")}
                        className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
                    >
                        Back to Home
                    </Button>
                </div>

                {/* RIGHT – form */}
                <Card className="bg-card/90 border-orange-500/20 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            {mfaResolver ? "Enter Authenticator Code" : "Sign In"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {mfaResolver
                                ? "Open your authenticator app and enter the 6-digit code"
                                : "Enter your credentials to access your account"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert className="mb-4 border-destructive bg-destructive/10">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <AlertDescription className="text-destructive">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* TOTP Form */}
                        {mfaResolver ? (
                            <form onSubmit={handleTotpSubmit} className="space-y-4">
                                <div className="flex justify-center">
                                    <Shield className="h-12 w-12 text-orange-500" />
                                </div>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                                    placeholder="000000"
                                    className="text-center text-2xl tracking-widest font-mono h-14"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                                    disabled={isLoading || totpCode.length !== 6}
                                >
                                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMfaResolver(null);
                                        setTotpCode("");
                                        setError("");
                                    }}
                                    className="text-sm text-orange-500 hover:text-orange-400 underline w-full text-center"
                                >
                                    Back to email login
                                </button>
                            </form>
                        ) : (
                            /* Email + Password Form */
                            <form onSubmit={handleFirstFactor} className="space-y-4">
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Email address"
                                    required
                                    className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-orange-500"
                                />
                                <div className="relative">
                                    <Input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        required
                                        className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-orange-500 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="text-right">
                                    <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-400">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold transition-all duration-300 transform hover:scale-105"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing In..." : "Sign In"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Don't have an account?{" "}
                                    <Link href="/register" className="text-orange-500 hover:text-orange-400">
                                        Sign up
                                    </Link>
                                </p>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}