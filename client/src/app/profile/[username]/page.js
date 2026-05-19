"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatTimeAgo } from "../../utils/formatTime";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare, FileText, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function PublicProfile() {
    const { username } = useParams();
    const router = useRouter();

    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!username) return;

        // decoding username since it can have URI encoding like %20
        const decodedUsername = decodeURIComponent(username);

        const fetchData = async () => {
            try {
                setLoading(true);
                // again fetching all posts
                const response = await axios.get("https://the-blog-zone-server.vercel.app/api/blog");
                const allPosts = response.data;

                // again filtering posts by this user (deduplicated)
                const seenPostIds = new Set();
                const postsByThisUser = [];

                allPosts.forEach(post => {
                    if (post.Blogger.username === decodedUsername && !seenPostIds.has(post.id)) {
                        postsByThisUser.push(post);
                        seenPostIds.add(post.id);
                    }
                });

                // again filtering comments by this user (deduplicated)
                const seenCommentIds = new Set();
                const commentsByThisUser = [];

                allPosts.forEach(post => {
                    if (post.Comments && post.Comments.length > 0) {
                        post.Comments.forEach(comment => {
                            if (comment.Blogger.username === decodedUsername && !seenCommentIds.has(comment.id)) {
                                commentsByThisUser.push({
                                    ...comment,
                                    postTitle: post.title,
                                    postId: post.id
                                });
                                seenCommentIds.add(comment.id);
                            }
                        });
                    }
                });

                setUserPosts(postsByThisUser);
                setUserComments(commentsByThisUser);

                // trying to derive profile info
                // we prioritize info from their posts as it's likely more standardized
                let foundUser = null;
                if (postsByThisUser.length > 0) {
                    foundUser = postsByThisUser[0].Blogger;
                } else if (commentsByThisUser.length > 0) {
                    foundUser = commentsByThisUser[0].Blogger;
                }

                if (foundUser) {
                    setProfileUser({
                        name: foundUser.name,
                        username: foundUser.username,
                        createdAt: foundUser.createdAt,
                    });
                } else {
                    setProfileUser({
                        name: decodedUsername, // Fallback
                        username: decodedUsername,
                        isUnknown: true,
                        createdAt: null
                    });
                }

            } catch (err) {
                console.error("Failed to fetch profile data:", err);
                setError("Failed to load user profile.");
                toast.error("Failed to load user profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6 space-y-8 flex flex-col items-center justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[400px] w-full max-w-2xl rounded-xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-4xl mx-auto flex h-16 items-center px-4">
                    <Button variant="ghost" size="icon" asChild className="mr-4">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold">User Profile</h1>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-8">
                {/* Profile Card */}
                <Card className="border-none shadow-md bg-card/50">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24 border-2 border-primary/20">
                            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                {profileUser?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left space-y-1">
                            <h2 className="text-2xl font-bold">{profileUser?.name}</h2>
                            <p className="text-muted-foreground">@{profileUser?.username}</p>
                            {profileUser?.createdAt && (
                                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-2">
                                    Joined {formatTimeAgo(profileUser.createdAt).split(",")[0].trim()}
                                </div>
                            )}
                            {profileUser?.isUnknown && (
                                <p className="text-xs text-amber-500 mt-2">
                                    Note: This user has no posts or comments visible, or information is incomplete.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Content Tabs */}
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
                        <TabsTrigger value="posts" className="gap-2">
                            <FileText className="h-4 w-4" /> Posts ({userPosts.length})
                        </TabsTrigger>
                        <TabsTrigger value="comments" className="gap-2">
                            <MessageSquare className="h-4 w-4" /> Comments ({userComments.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="space-y-4">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <Card
                                    key={post.id}
                                    className="hover:border-primary/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/dashboard/${post.id}`)}
                                >
                                    <CardHeader>
                                        <CardTitle className="text-lg hover:underline decoration-primary/50 underline-offset-4">
                                            {post.title}
                                        </CardTitle>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {formatTimeAgo(post.createdAt)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground line-clamp-2 text-sm">
                                            {post.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                No posts found for this user.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="comments" className="space-y-4">
                        {userComments.length > 0 ? (
                            userComments.map((comment, index) => (
                                <Card
                                    key={`${comment.id}-${index}`}
                                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/dashboard/${comment.postId}`)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="text-sm text-muted-foreground">
                                            Commented on <span className="font-medium text-primary hover:underline" onClick={(e) => {
                                                e.stopPropagation();
                                            }}>{comment.postTitle}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-foreground/90 text-sm">"{comment.content}"</p>
                                        <div className="text-xs text-muted-foreground mt-2">
                                            {formatTimeAgo(comment.createdAt)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                No comments found for this user.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

            </main>
        </div>
    );
}
