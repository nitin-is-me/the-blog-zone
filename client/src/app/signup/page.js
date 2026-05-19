'use client';
import axios from 'axios';
import { useState } from "react";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

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

    // trimming name but allowwing spaces between words
    const trimmedName = name.trim();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://the-blog-zone-server.vercel.app/api/auth/signup", {
        username,
        name: trimmedName,
        password,
      });

      if (response.status === 201 && response.data.token) {
        localStorage.setItem("token", response.data.token);
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
                  Creating account...
                </>
              ) : (
                "Sign Up"
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
      </Card>
    </div>
  );
}
