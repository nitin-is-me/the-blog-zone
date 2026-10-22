'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Shield,
  Lock,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Github,
  CheckCircle2,
  Menu,
  X,
  EyeOff,
  FileText,
  Code2,
  Heart,
  ExternalLink,
  ChevronRight,
  Layers,
  ShieldCheck
} from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/verifyToken", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200) {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          setIsAuthenticated(false);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/favicon.ico"
              alt="The Blog Zone Logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform"
              priority
            />
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              The Blog Zone
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <a
              href="https://github.com/nitin-is-me/the-blog-zone"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              Source
            </a>
          </nav>

          {/* Right Action Area (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle />
            {loading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            ) : isAuthenticated ? (
              <Button asChild className="rounded-full shadow-md bg-primary hover:bg-primary/90">
                <Link href="/dashboard" className="gap-2">
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-full">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="rounded-full shadow-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b bg-background/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 font-medium text-base">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Features
              </a>
              <Link
                href="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                About The Project
              </Link>
              <a
                href="https://github.com/nitin-is-me/the-blog-zone"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                Source Code on GitHub
              </a>
            </nav>

            <div className="pt-2 border-t flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Button asChild className="w-full rounded-xl py-5 text-base">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="w-full rounded-xl py-5 text-base bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full rounded-xl py-5 text-base">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-32">
        {/* Ambient Glowing Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-500/20 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-purple-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="https://github.com/nitin-is-me/the-blog-zone#version-history"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span>Version 6.1.0</span>
              <ChevronRight className="h-3 w-3 opacity-70" />
            </a>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Privacy First & Open Source
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Write Freely. <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Own Every Single Word.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The Blog Zone is an open-source, privacy-first platform to publish stories publicly or keep personal journals protected by military-grade encryption. Zero trackers. No forced identity.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Button size="lg" asChild className="w-full sm:w-auto text-base px-8 py-6 rounded-full shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                <Link href="/dashboard" className="gap-2 font-semibold">
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  asChild
                  className="w-full sm:w-auto text-base px-8 py-6 rounded-full shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-95 hover:scale-[1.02] transition-all"
                >
                  <Link href="/signup" className="gap-2 font-semibold">
                    Start Writing for Free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto text-base px-8 py-6 rounded-full border-2 hover:bg-muted/80"
                >
                  <Link href="/dashboard">
                    Explore Articles
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Feature Highlight Pills */}
          <div className="pt-8 border-t border-muted/50 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs sm:text-sm font-medium text-muted-foreground">
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-card/40 border">
              <Lock className="h-4 w-4 text-indigo-500" />
              <span>Military-Grade Encryption</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-card/40 border">
              <EyeOff className="h-4 w-4 text-emerald-500" />
              <span>Anonymous Signup</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-card/40 border">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Transparent AI</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-card/40 border">
              <MessageSquare className="h-4 w-4 text-pink-500" />
              <span>Nested Discussions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid Section */}
      <section id="features" className="py-20 sm:py-28 bg-muted/20 border-t relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              Built Different
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Engineered for Freedom & Privacy
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Everything you need to write, express, and discuss without compromising your privacy or being locked into corporate walled gardens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <Card className="bg-card/60 backdrop-blur-sm border hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-500 mb-3 group-hover:scale-110 transition-transform">
                  <Lock className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Encrypted Private Journaling</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Private posts are automatically protected with military-grade encryption before saving to the database. Not even database administrators can inspect your personal diaries.
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="bg-card/60 backdrop-blur-sm border hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-500 mb-3 group-hover:scale-110 transition-transform">
                  <EyeOff className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Anonymous by Default</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                No phone number, no forced email, no trackers. You can sign up with just a username. Email is completely optional and strictly used for password recovery.
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="bg-card/60 backdrop-blur-sm border hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all group">
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-500 mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Rich Text & Auto-Clean Media</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Powered by Tiptap for a distraction-free writing experience. Direct image uploads with automated background cleanup whenever images or posts are removed.
              </CardContent>
            </Card>

            {/* Card 4 */}
            <Card className="bg-card/60 backdrop-blur-sm border hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all group">
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-500 mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Privacy-Guarded AI</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Polish drafts or generate 3-bullet summaries with lightning-fast AI. Upfront transparent warnings advise you never to feed confidential drafts to external models.
              </CardContent>
            </Card>

            {/* Card 5 */}
            <Card className="bg-card/60 backdrop-blur-sm border hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5 transition-all group">
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-pink-500/10 text-pink-500 mb-3 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Infinitely Nested Replies</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Engage in deep, structured conversations with unlimited comment reply levels, powered by an efficient relational Adjacency List model in SQL.
              </CardContent>
            </Card>

            {/* Card 6 */}
            <Card className="bg-card/60 backdrop-blur-sm border hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                  <Code2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">100% Open & Transparent</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Full transparency with zero proprietary black boxes. Every API route and client component is publicly inspectable and verifiable on GitHub.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dedicated Privacy Spotlight Section */}
      <section className="py-20 sm:py-24 border-t relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-background shadow-xl">
            <CardContent className="p-8 sm:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 text-indigo-500 font-semibold text-sm">
                <Shield className="h-5 w-5" />
                <span>The Privacy Guarantee</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                No Ad Trackers. No Data Brokering. No Invasive Profiling.
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Most platforms treat you as the product to sell targeted ads. The Blog Zone was built as an antidote: private posts stay encrypted, anonymous signups are supported natively, and your writing is never scraped for commercial gain.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Button asChild className="rounded-full shadow-md">
                  <Link href="/privacy" className="gap-2">
                    Read The Full Privacy Policy
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="rounded-full">
                  <Link href="/about">
                    About The Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 sm:py-20 bg-muted/40 border-t text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Experience Truly Private Blogging?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Create an anonymous account in under 30 seconds or explore articles written by independent thinkers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Button size="lg" asChild className="w-full sm:w-auto px-8 rounded-full">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="w-full sm:w-auto px-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <Link href="/signup">Create Anonymous Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto px-8 rounded-full">
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <Link href="/" className="flex items-center gap-2 group">
                <Image
                  src="/favicon.ico"
                  alt="The Blog Zone Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-md object-contain"
                />
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                  The Blog Zone
                </span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm">
                Open-source, privacy-first blogging platform with military-grade encryption and zero commercial tracking.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Articles
              </Link>
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">
                Sign Up
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Login
              </Link>
              <a
                href="https://github.com/nitin-is-me/the-blog-zone"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>
              © {new Date().getFullYear()} The Blog Zone. An open-source project by{" "}
              <a
                href="https://github.com/nitin-is-me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                @nitin-is-me
              </a>
              .
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/nitin-is-me/the-blog-zone#version-history"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Version 6.1.0
              </a>
              <span>•</span>
              <span className="text-emerald-500 font-medium">Privacy Protected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
