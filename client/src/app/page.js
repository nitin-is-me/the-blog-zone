'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { Github } from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState({
    login: false,
    signup: false,
    dashboard: false,
  });

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
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleButtonClick = (type) => {
    setButtonLoading((prev) => ({ ...prev, [type]: true }));
    router.push(`/${type}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
          <p className="text-muted-foreground text-lg font-medium">Checking your status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative selection:bg-primary selection:text-primary-foreground">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

          <Card className="relative border-none shadow-2xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pt-12 pb-8">
              <CardTitle className="text-5xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                The Blog Zone
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground max-w-lg mx-auto">
                Dive into a world of creativity, ideas, and stories. Share yours or explore what others have to say.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-6 pb-12">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300"
                  disabled={buttonLoading.dashboard}
                  onClick={() => handleButtonClick("dashboard")}
                >
                  {buttonLoading.dashboard ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary-foreground mr-2" />
                  ) : null}
                  Go to Dashboard
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-40 text-lg py-6 rounded-full shadow-lg"
                    disabled={buttonLoading.login}
                    onClick={() => handleButtonClick("login")}
                  >
                    {buttonLoading.login && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary-foreground mr-2" />}
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-40 text-lg py-6 rounded-full border-2"
                    disabled={buttonLoading.signup}
                    onClick={() => handleButtonClick("signup")}
                  >
                    {buttonLoading.signup && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary mr-2" />}
                    Sign Up
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center border-t py-6 bg-muted/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>An open source project by</span>
                <a
                  href="https://github.com/nitin-is-me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1"
                >
                  @nitin-is-me
                </a>
              </div>
              <div className="mt-4 flex gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com/nitin-is-me/the-blog-zone-client" target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Github className="h-4 w-4" />
                    Frontend
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com/nitin-is-me/the-blog-zone-server" target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Github className="h-4 w-4" />
                    Backend
                  </a>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
