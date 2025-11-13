"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dumbbell,
    Eye,
    EyeOff,
    ArrowRight,
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
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);
        const email = data.get("email") as string;
        const password = data.get("password") as string;

        setIsLoading(true);
        try {
            // Call login API
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error);
            }

            // Sign in with custom token on client side
            await signInWithCustomToken(auth, result.token);

            const role = result.user.role;

            if (role === "admin" || role === "owner") {
                router.push("/a/dashboard");
            } else {
                router.push("/c/dashboard");
            }
        } catch (err: any) {
            alert(err.message || "Login failed");
        } finally {
            setIsLoading(false);
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
                            Sign In
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <Input
                                name="email"
                                type="email"
                                placeholder="Email address"
                                required
                                className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-orange-500"
                            />

                            {/* Password */}
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

                            <div className="text-right">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-orange-500 hover:text-orange-400"
                                >
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
                                Don&#39;t have an account?{" "}
                                <Link href="/register" className="text-orange-500 hover:text-orange-400">
                                    Sign up
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}