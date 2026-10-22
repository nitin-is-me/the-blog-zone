'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Bot, Trash2, Cpu } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
            <Image
              src="/favicon.ico"
              alt="The Blog Zone Logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg object-contain group-hover:scale-105 transition-transform"
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              The Blog Zone
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-1 text-sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Title */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Privacy First Architecture
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Privacy Policy & Guarantees
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your thoughts, drafts, and personal stories belong exclusively to you. Here is how The Blog Zone's architecture enforces that guarantee.
          </p>
        </div>

        {/* Section 1: Anonymity */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="p-2.5 w-fit rounded-lg bg-indigo-500/10 text-indigo-500 mb-1">
              <EyeOff className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold">1. Anonymous by Default</CardTitle>
            <CardDescription>No real-name verification, no phone numbers, no forced emails.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            <p>
              When creating an account on The Blog Zone, you only need to choose a username and password. The platform does not require an email address or real name.
            </p>
            <p>
              If you optionally choose to provide an email during signup or in your Profile Settings, it is used <strong>solely for account password recovery</strong> via a one-time 6-digit verification code (OTP). Your email will never be sold, shared, or spammed.
            </p>
          </CardContent>
        </Card>

        {/* Section 2: Military-Grade Encryption */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="p-2.5 w-fit rounded-lg bg-purple-500/10 text-purple-500 mb-1">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold">2. Military-Grade Encryption for Private Posts</CardTitle>
            <CardDescription>Industry-standard cryptography protects your personal diaries and confidential drafts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            <p>
              When you mark a blog post as <strong>Private</strong>, both its title and content are encrypted on the server using Node’s cryptographic algorithms (AES-256) before reaching the PostgreSQL database.
            </p>
            <p>
              In the database, private thoughts look like random hexadecimal ciphertext. Not even database administrators or hosting operators can read your content. The ciphertext is decrypted only when the original author's authenticated session requests it.
            </p>
          </CardContent>
        </Card>

        {/* Section 3: AI Privacy */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="p-2.5 w-fit rounded-lg bg-amber-500/10 text-amber-500 mb-1">
              <Bot className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold">3. Transparent AI Processing Guardrails</CardTitle>
            <CardDescription>You are always warned before AI sees your words.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            <p>
              AI writing assistance (improving drafts, simplifying sentences, summarizing articles) is powered by Groq Cloud APIs. Because privacy is the core priority:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
              <li>Before any text is sent to the AI service, you receive a transparent warning modal informing you that external processing will occur.</li>
              <li>Writers are actively advised never to run AI actions on confidential or sensitive private posts.</li>
              <li>AI is only invoked on text you explicitly highlight and request assistance for. Drafts are never automatically scanned or scraped in the background.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4: Auto-cleanup */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="p-2.5 w-fit rounded-lg bg-rose-500/10 text-rose-500 mb-1">
              <Trash2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold">4. Automatic Media & Data Cleanup</CardTitle>
            <CardDescription>Deleted posts mean deleted files.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            <p>
              When you upload images into the rich text editor, they are stored securely in Supabase storage buckets. If you delete an image from your post, delete the post itself, or if an account is removed, the backend automatically purges the corresponding media files from the storage bucket so no orphaned images linger on servers.
            </p>
          </CardContent>
        </Card>

        {/* Section 5: Tracking & Cookies */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-500 mb-1">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold">5. Zero Ad Tracking & Zero Surveillance</CardTitle>
            <CardDescription>No third-party trackers, pixels, or profiling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            <p>
              The Blog Zone does not embed Google Analytics, Facebook Pixel, advertising networks, or third-party behavioral profiling tools. Your authentication token is securely stored in your browser's localStorage and is only transmitted to the API to authenticate your requests.
            </p>
          </CardContent>
        </Card>

        {/* Open Source Notice */}
        <div className="text-center p-6 border rounded-xl bg-muted/20 space-y-3">
          <h3 className="font-semibold text-lg">Verifiable Security</h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Unlike closed-source platforms that ask users to blindly trust privacy claims, the entire codebase is open on GitHub. Anyone can inspect and verify the encryption algorithms, API routers, and database schemas.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://github.com/nitin-is-me/the-blog-zone" target="_blank" rel="noopener noreferrer">
              Audit the Source Code on GitHub
            </a>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} The Blog Zone. Privacy First Blogging.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <a href="https://github.com/nitin-is-me/the-blog-zone" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
