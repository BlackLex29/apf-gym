"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dumbbell,
    Eye,
    EyeOff,
    ArrowRight,
    Mail,
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
import Link from "next/link";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);
        const email = data.get("email") as string;

        const ADMIN_EMAIL = "rafaelleviste44@gmail.com";
        const OWNER_EMAIL = "marklorenze84@gmail.com";

        let assignedRole = "client";

        if (email === ADMIN_EMAIL) {
            assignedRole = "admin";
        } else if (email === OWNER_EMAIL) {
            assignedRole = "owner";
        }

        const payload = {
            firstName: data.get("firstName"),
            lastName: data.get("lastName"),
            email: email,
            phone: data.get("phone"),
            password: data.get("password"),
            role: assignedRole,
        };

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error);

            setUserEmail(email);
            setShowSuccess(true);
        } catch (err: any) {
            alert(err.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error);

            alert("Verification email resent! Please check your inbox.");

            setResendCooldown(60);
            const interval = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            alert(err.message || "Failed to resend verification email");
        } finally {
            setIsResending(false);
        }
    };

    // Success screen after registration
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-muted to-orange-900/20 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-card/90 border-orange-500/20 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-orange-500 rounded-full">
                                <Mail className="h-8 w-8 text-black" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Check Your Email
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            We've sent a verification link to
                            <br />
                            <span className="font-semibold text-orange-500">{userEmail}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Please check your email and click the verification link to activate your account.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Don't forget to check your spam folder if you don't see the email.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Didn't receive email?
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handleResendVerification}
                            variant="outline"
                            className="w-full border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-black"
                            disabled={isResending || resendCooldown > 0}
                        >
                            {isResending
                                ? "Resending..."
                                : resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : "Resend Verification Email"}
                        </Button>

                        <Button
                            onClick={() => router.push("/login")}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                        >
                            Go to Login
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Main registration form
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted to-orange-900/20 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
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
                            <span className="text-balance">Create Your Account</span>
                            <br />
                            <span className="text-balance text-orange-500">
                                Start Training Smarter
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Join APF Tanauan and get instant access to booking, coach chat, and
                            progress tracking.
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

                <Card className="bg-card/90 border-orange-500/20 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            Sign Up
                        </CardTitle>
                        <CardDescription className="text-center">
                            Fill in the details to create your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    name="firstName"
                                    placeholder="First Name"
                                    required
                                    className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-orange-500"
                                />
                                <Input
                                    name="lastName"
                                    placeholder="Last Name"
                                    required
                                    className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-orange-500"
                                />
                            </div>

                            <Input
                                name="email"
                                type="email"
                                placeholder="Email address"
                                required
                                className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-orange-500"
                            />

                            <Input
                                name="phone"
                                type="tel"
                                placeholder="Phone number"
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
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            <div className="flex items-start space-x-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="mt-1 h-4 w-4 text-orange-500 bg-input border-border rounded focus:ring-orange-500"
                                />
                                <label htmlFor="terms" className="text-sm text-muted-foreground">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-orange-500 hover:text-orange-400">
                                        Terms and Conditions
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-orange-500 hover:text-orange-400">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold transition-all duration-300 transform hover:scale-105"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating Account..." : "Create Account"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="text-orange-500 hover:text-orange-400">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}