"use client";

import { useEffect, useState } from "react";
import {
    multiFactor,
    signOut,
    TotpMultiFactorGenerator,
    TotpSecret,
    User,
} from "firebase/auth";
import { QRCodeSVG } from "qrcode.react";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*  Helper – the secret key is private, but we know it exists at runtime.    */
/* -------------------------------------------------------------------------- */
const getSecretKey = (secret: TotpSecret): string => {
    // @ts-ignore – secret key is private but present on the object
    return secret.secret;
};

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
    const [code, setCode] = useState("");
    const [enrolled, setEnrolled] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [actuallyEnrolled, setActuallyEnrolled] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
            if (currentUser) {
                setEnrolled(
                    multiFactor(currentUser).enrolledFactors.some(
                        (f) => f.factorId === TotpMultiFactorGenerator.FACTOR_ID
                    )
                );
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const checkEnrollment = multiFactor(user).enrolledFactors.some(
                (f) => f.factorId === TotpMultiFactorGenerator.FACTOR_ID
            );
            setActuallyEnrolled(checkEnrollment);
        }
    }, [user, enrolled]);

    // NOW you can do the early return AFTER all hooks
    if (authLoading) {
        return <div className="max-w-2xl mx-auto p-6">Loading...</div>;
    }

    const handleLogout = async () => {
        setLoading(true);
        setError(null);

        try {
            await signOut(auth);
            router.push("/login");
        } catch (e: any) {
            setError(e?.message || "Failed to sign out.");
        } finally {
            setLoading(false);
        }
    };

    const isEnrolled = user
        ? multiFactor(user).enrolledFactors.some(
            (f) => f.factorId === TotpMultiFactorGenerator.FACTOR_ID
        )
        : false;

    console.log("User:", user?.email);
    console.log("Enrolled factors:", user ? multiFactor(user).enrolledFactors : []);
    console.log("Is enrolled:", isEnrolled);
    console.log("Enrolled state:", enrolled);

    /* --------------------------------------------------------------- */
    /*  1. Start enrollment – generate secret + QR                    */
    /* --------------------------------------------------------------- */
    const startEnrollment = async () => {
        if (!user) {
            setError("You must be logged in.");
            return;
        }

        setLoading(true);
        setError(null);
        setQrUrl(null);
        setCode("");

        try {
            const resolver = multiFactor(user);
            const session = await resolver.getSession();
            const secret = await TotpMultiFactorGenerator.generateSecret(session);

            const uri = secret.generateQrCodeUrl(user.email ?? "user", "GymSched Pro");
            setQrUrl(uri);
            setTotpSecret(secret);
        } catch (e: any) {
            console.error(e);
            setError(
                e?.message ||
                "Failed to generate TOTP. Is TOTP enabled in the Firebase console?"
            );
        } finally {
            setLoading(false);
        }
    };

    // After successful enrollment, reload the user
    const verifyAndEnroll = async () => {
        if (!user || !totpSecret || code.length !== 6) return;

        setLoading(true);
        setError(null);

        try {
            const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
                totpSecret,
                code
            );
            await multiFactor(user).enroll(assertion, "TOTP Authenticator");

            // Reload the user to get fresh MFA data
            await user.reload();

            setEnrolled(true);
            setQrUrl(null);
            setTotpSecret(null);
            setCode("");
            setRefreshKey(prev => prev + 1); // Force re-render
        } catch (e: any) {
            console.error(e);
            const msg = e?.message || "Unknown error";
            if (msg.includes("INVALID_TOTP_VERIFICATION_CODE")) {
                setError("Code expired or invalid – try a fresh code.");
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    /* --------------------------------------------------------------- */
    /*  3. Un‑enroll (remove TOTP)                                    */
    /* --------------------------------------------------------------- */
    const unenroll = async () => {
        if (!user) return;

        const factor = multiFactor(user).enrolledFactors.find(
            (f) => f.factorId === TotpMultiFactorGenerator.FACTOR_ID
        );
        if (!factor) return;

        setLoading(true);
        setError(null);

        try {
            await multiFactor(user).unenroll(factor.uid);

            // ADD THIS: Reload user to get updated MFA status
            await user.reload();

            setEnrolled(false);
            setQrUrl(null);
            setTotpSecret(null);
        } catch (e: any) {
            setError(e?.message || "Failed to remove TOTP.");
        } finally {
            setLoading(false);
        }
    };

    /* --------------------------------------------------------------- */
    /*  UI                                                            */
    /* --------------------------------------------------------------- */
    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Security Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage two‑factor authentication and account security.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="h-6 w-6 text-orange-500" />
                            <div>
                                <CardTitle>Two‑Factor Authentication (TOTP)</CardTitle>
                                <CardDescription>
                                    Add an extra layer of security using an authenticator app.
                                </CardDescription>
                            </div>
                        </div>

                        {(isEnrolled || enrolled) && (
                            <Badge variant="default" className="bg-green-500">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Active
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* ------------------------------------------------------- */}
                    {/*  Not enrolled – show enable button                      */}
                    {/* ------------------------------------------------------- */}
                    {!actuallyEnrolled && !enrolled && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Use Google Authenticator, Authy, or any TOTP‑compatible app.
                                </p>

                                <Button
                                    onClick={startEnrollment}
                                    disabled={loading || !user}
                                    size="sm"
                                    type="button"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        "Enable TOTP"
                                    )}
                                </Button>
                            </div>

                            {/* --------------------------------------------------- */}
                            {/*  QR + verification UI                               */}
                            {/* --------------------------------------------------- */}
                            {qrUrl && totpSecret && (
                                <div className="space-y-6 p-6 border rounded-lg bg-muted/30">
                                    {/* QR code */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium">1. Scan QR Code</h4>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={startEnrollment}
                                                type="button"
                                            >
                                                <RefreshCw className="h-4 w-4 mr-1" />
                                                Regenerate
                                            </Button>
                                        </div>
                                        <div className="flex justify-center p-4 bg-white rounded-lg">
                                            <QRCodeSVG value={qrUrl} size={180} />
                                        </div>
                                    </div>

                                    {/* Manual key */}
                                    <div>
                                        <h4 className="font-medium mb-2">Or Enter Manually</h4>
                                        <code className="block p-3 bg-muted text-xs font-mono rounded break-all">
                                            {getSecretKey(totpSecret)}
                                        </code>
                                    </div>

                                    {/* Code input */}
                                    <div>
                                        <h4 className="font-medium mb-2">
                                            2. Enter 6‑Digit Code
                                        </h4>
                                        <div className="flex gap-3 items-center">
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={code}
                                                onChange={(e) =>
                                                    setCode(e.target.value.replace(/\D/g, ""))
                                                }
                                                placeholder="000000"
                                                className="w-32 text-center text-lg font-mono"
                                                autoFocus
                                            />
                                            <Button
                                                onClick={verifyAndEnroll}
                                                disabled={loading || code.length !== 6}
                                                className="bg-green-600 hover:bg-green-700"
                                                type="button"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    "Verify & Enroll"
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Enter the code **immediately** after scanning – it expires
                                            in 30 seconds.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ------------------------------------------------------- */}
                    {/*  Enrolled – show success + remove button                */}
                    {/* ------------------------------------------------------- */}
                    {(isEnrolled || enrolled) && (
                        <div className="space-y-4">
                            <Alert className="border-green-200 bg-green-50">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    TOTP is <strong>active</strong> and protecting your account.
                                </AlertDescription>
                            </Alert>

                            <Button
                                onClick={unenroll}
                                variant="destructive"
                                disabled={loading}
                                className="w-full sm:w-auto"
                                type="button"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    "Remove TOTP"
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>
                        Manage your session and account access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        disabled={loading}
                        className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        type="button"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing out...
                            </>
                        ) : (
                            "Sign Out"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* ----------------------------------------------------------- */}
            {/*  Global error alert                                         */}
            {/* ----------------------------------------------------------- */}
            {error && (
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}