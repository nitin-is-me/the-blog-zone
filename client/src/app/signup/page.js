'use client';
import axios from 'axios';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ArrowLeft, RefreshCw, ShieldCheck, Mail } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";

export default function SignupPage() {
  const [step, setStep] = useState("form"); // "form" | "verify"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let timer;
    if (step === "verify" && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate fields
    if (/\s/.test(username)) {
      setUsernameError("Spaces are not allowed");
      return;
    }

    if (/\s/.test(password)) {
      setPasswordError("Spaces are not allowed");
      return;
    }

    const trimmedName = name.trim();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://the-blog-zone-server.vercel.app/api/auth/signup", {
        username,
        name: trimmedName,
        password,
        email: email.trim() || undefined,
      });

      // Approach B: If email was provided, verification is required before account is created
      if (response.data.requiresVerification) {
        setSignupToken(response.data.signupToken);
        setStep("verify");
        setOtp("");
        setResendCooldown(30);
        toast.success("Verification code sent to your email!");
      } else if (response.status === 201 && response.data.token) {
        // Anonymous signup (no email provided): Created immediately
        localStorage.setItem("token", response.data.token);
        toast.success("Account created successfully!");
        router.push("/dashboard");
      } else {
        setError("Error signing up. Please try again.");
      }
    } catch (error) {
      setError(error.response?.data || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://the-blog-zone-server.vercel.app/api/auth/verify-signup", {
        signupToken,
        otp: otp.trim(),
      });

      if (response.status === 201 && response.data.token) {
        localStorage.setItem("token", response.data.token);
        toast.success("Email verified and account created successfully!");
        router.push("/dashboard");
      } else {
        setError("Failed to verify code. Please try again.");
      }
    } catch (error) {
      setError(error.response?.data || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError("");

    try {
      const response = await axios.post("https://the-blog-zone-server.vercel.app/api/auth/resend-signup-otp", {
        signupToken,
      });

      if (response.data.signupToken) {
        setSignupToken(response.data.signupToken);
      }
      setResendCooldown(30);
      toast.success("A new verification code has been sent!");
    } catch (error) {
      setError(error.response?.data || "Failed to resend verification code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameError(/\s/.test(value) ? "Spaces are not allowed" : "");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(/\s/.test(value) ? "Spaces are not allowed" : "");
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = () => {
    return username && password && name && !usernameError && !passwordError;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        {step === "form" ? (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center text-primary">Sign Up</CardTitle>
              <CardDescription className="text-center">
                Create an account to start blogging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Name (displayed to others)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={handleNameChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username (must be unique)</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                    disabled={loading}
                    className={usernameError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {usernameError && (
                    <p className="text-sm text-red-500">{usernameError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Required only if you want password recovery. A verification code will be sent.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      disabled={loading}
                      className={`pr-10 ${passwordError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>

                <Button className="w-full" type="submit" disabled={loading || !isFormValid()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {email.trim() ? "Sending verification code..." : "Creating account..."}
                    </>
                  ) : (
                    email.trim() ? "Continue to Email Verification" : "Sign Up"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                  Login
                </Link>
              </div>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-primary">Verify Your Email</CardTitle>
              <CardDescription className="text-center">
                We sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md text-center">
                    {error}
                  </div>
                )}

                <div className="p-3 rounded-lg bg-muted/60 border text-xs text-muted-foreground flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Your account is <strong>not created yet</strong>. It will only be saved once verified. If you close this page, no data is stored.
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-center block">Enter 6-digit Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoFocus
                    disabled={loading}
                    className="text-center text-2xl font-mono tracking-widest py-6 font-bold"
                  />
                </div>

                <Button className="w-full" type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying & creating account...
                    </>
                  ) : (
                    "Verify & Complete Sign Up"
                  )}
                </Button>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setStep("form");
                      setError("");
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Back to edit details
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary/80"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resending || loading}
                  >
                    {resending ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    )}
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t py-4 bg-muted/20">
              <div className="text-center text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or click Resend code.
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
