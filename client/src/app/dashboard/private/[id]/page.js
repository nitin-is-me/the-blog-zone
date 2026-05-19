'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { formatTimeAgo } from "../../../utils/formatTime";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Calendar, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function BlogPostPage() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null); // state for logged-in user
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setError("You must be logged in to see this private post");
        toast.error("You must be logged in to see this private post");
        return;
      }
      try {
        const response = await axios.get(`https://the-blog-zone-server.vercel.app/api/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(response.data);
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to fetch the blog post.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    // fetch the logged in user details
    const fetchLoggedInUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setLoggedInUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user data.");
        }
      }
    };

    fetchPost();
    fetchLoggedInUser();
  }, [id]);

  const handleBack = () => {
    router.push("/dashboard/private");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center space-y-6">
        <Skeleton className="h-10 w-3/4 max-w-2xl" />
        <Skeleton className="h-6 w-1/2 max-w-lg" />
        <Skeleton className="h-[300px] w-full max-w-4xl rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">

        <div className="flex items-center">
          <Button variant="ghost" className="gap-2" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" /> Back to Private Posts
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center border border-destructive/20 flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <p>{error}</p>
          </div>
        )}

        {post && (
          <article className="space-y-6 animate-in fade-in duration-500">
            {/* Privacy Badge */}
            <div className="flex justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                <Lock className="h-3 w-3" /> Private Post
              </span>
            </div>

            {/* Post Header */}
            <div className="space-y-4 text-center sm:text-left">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-foreground">{post.Blogger?.name || "You"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Post Content */}
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {post.content}
              </CardContent>
            </Card>

            <Separator className="my-8" />

            <div className="text-center text-sm text-muted-foreground pb-8">
              <p>This post is private and visible only to you.</p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
