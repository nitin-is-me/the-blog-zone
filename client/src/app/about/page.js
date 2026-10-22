'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowLeft, Github, Shield, Lock, BookOpen, Database, Users, Code2, Heart } from "lucide-react";

export default function AboutPage() {
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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Title */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">
            The Story & Mission
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            About The Blog Zone
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An open-source, privacy-first blogging haven designed for people who want to share their thoughts or keep private journals without corporate tracking.
          </p>
        </div>

        {/* Origin Story */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Why The Blog Zone Was Built
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              In an internet dominated by algorithmic feeds, aggressive ad-trackers, and mandatory personal data harvesting, writing has lost much of its original serenity. Platforms demand your phone number, your real name, and scan your private drafts to train commercial advertising models.
            </p>
            <p>
              <strong>The Blog Zone</strong> was created as a modern alternative. Here, anonymity is a first-class feature: you don't need to provide an email or real-world identity to create an account. You get a distraction-free writing environment with powerful rich-text capabilities, thoughtful AI assistance that warns you before processing text, and unbreakable encryption for your personal diaries.
            </p>
          </CardContent>
        </Card>

        {/* Pillars Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">Core Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border bg-card/50">
              <CardHeader>
                <div className="p-2.5 w-fit rounded-lg bg-indigo-500/10 text-indigo-500 mb-2">
                  <Lock className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold">Military-Grade Encryption</CardTitle>
                <CardDescription>
                  Private posts are protected with military-grade encryption before they ever touch the database. Even database administrators cannot read your content.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border bg-card/50">
              <CardHeader>
                <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-500 mb-2">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold">Zero Identity Demands</CardTitle>
                <CardDescription>
                  Signup with just a username and password. Email is 100% optional, used only for password recovery via secure 6-digit OTP codes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border bg-card/50">
              <CardHeader>
                <div className="p-2.5 w-fit rounded-lg bg-purple-500/10 text-purple-500 mb-2">
                  <Database className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold">Engineered to Scale</CardTitle>
                <CardDescription>
                  Migrated from MongoDB to PostgreSQL to guarantee data integrity, reliable relationships, and infinitely nested discussion threads.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border bg-card/50">
              <CardHeader>
                <div className="p-2.5 w-fit rounded-lg bg-blue-500/10 text-blue-500 mb-2">
                  <Code2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold">100% Open Source</CardTitle>
                <CardDescription>
                  Every single line of code is open on GitHub. No closed doors, no proprietary analytics, and total community transparency.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Creator Note */}
        <Card className="border bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 fill-red-500/20" />
              Crafted by @nitin-is-me
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Hi, I'm Nitin! I started building The Blog Zone during college to solve a simple problem: I wanted a sleek, private space to write without feeling surveilled or overwhelmed by bloated social networks. Over months of continuous updates and testing, it grew into a full-fledged blogging platform.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/nitin-is-me/the-blog-zone" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Github className="h-4 w-4" />
                  View Repository
                </a>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">
                  Start Writing Today
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} The Blog Zone. Open-source under MIT License.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <a href="https://github.com/nitin-is-me/the-blog-zone" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
