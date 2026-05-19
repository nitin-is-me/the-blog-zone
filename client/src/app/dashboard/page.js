"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "../utils/formatTime";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronDown, UserCircle, Plus, X, Lock, Menu, Filter, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const router = useRouter();

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Loading states
  const [userLoading, setUserLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        } finally {
          setUserLoading(false);
        }
      } else {
        setUserLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axios.get("https://the-blog-zone-server.vercel.app/api/blog");
        setPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        setError("Failed to fetch blog posts.");
        toast.error("Failed to fetch blog posts.");
      } finally {
        setPostsLoading(false);
      }
    };

    setUserLoading(true);
    setPostsLoading(true);

    fetchCurrentUser();
    fetchPosts();
  }, []);

  const overallLoading = userLoading || postsLoading;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(post => {
      switch (searchField) {
        case "title":
          return post.title.toLowerCase().includes(query);
        case "content":
          return post.content.toLowerCase().includes(query);
        case "author":
          return post.Blogger.name.toLowerCase().includes(query);
        default:
          return true;
      }
    });

    setFilteredPosts(filtered);
  }, [searchQuery, searchField, posts]);

  const handleDelete = async (postId) => {


    setDeletingPostId(postId);
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://the-blog-zone-server.vercel.app/api/blog/delete/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedPosts = posts.filter((post) => post.id !== postId);
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts);
      toast.success("Post deleted successfully.");
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError("Could not delete the post. Try again.");
      toast.error("Could not delete the post. Try again.");
    } finally {
      setDeletingPostId(null);
    }
  };

  if (overallLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                The Blog Zone
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className={isSearchVisible ? "bg-accent" : ""}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/dashboard/private">
              <Button variant="secondary" size="sm" className="hidden sm:flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Private
              </Button>
              {/* mobile icon only */}
              <Button variant="secondary" size="icon" className="sm:hidden">
                <Lock className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
              </Button>
            </Link>

            <ModeToggle />
          </div>
        </div>

        {/* search bar */}
        {isSearchVisible && (
          <div className="border-t bg-muted/30 px-4 py-4 animate-in slide-in-from-top-2">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[140px] justify-between">
                    <span className="capitalize">{searchField}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSearchField("title")}>Title</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchField("content")}>Content</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchField("author")}>Author</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="max-w-3xl mx-auto mt-2 text-xs text-muted-foreground">
              {searchQuery ? `Found ${filteredPosts.length} results` : ""}
            </div>
          </div>
        )}
      </header>

      {/* main */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Welcome back, {currentUser?.name?.split(" ")[0]}
          </h1>
          <p className="text-lg text-muted-foreground">
            Catch up on the latest stories or write your own.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-center border border-destructive/20">
            {error}
          </div>
        )}

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group relative flex flex-col overflow-hidden border-muted transition-all hover:shadow-xl hover:border-primary/20 bg-card/50 backdrop-blur-sm cursor-pointer"
                onClick={() => router.push(`/dashboard/${post.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Link
                      href={post.Blogger.username === currentUser?.username ? "/profile" : `/profile/${post.Blogger.username}`}
                      className="font-medium text-foreground mr-2 hover:underline hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.Blogger.name}
                    </Link>
                    <span>• {formatTimeAgo(post.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pb-4">
                  <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                    {post.content}
                  </p>
                </CardContent>

                {currentUser?.username === post.Blogger.username && (
                  <CardFooter className="pt-0 flex items-center justify-between border-t bg-muted/10 p-4 mt-auto">

                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/edit-blog/${post.id}`);
                    }}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-destructive/10"
                          disabled={deletingPostId === post.id}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {deletingPostId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post.id);
                          }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 border-2 border-dashed border-muted rounded-xl bg-muted/5">
            <div className="mx-auto h-12 w-12 text-muted-foreground flex items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No posts found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              We couldn't find any posts matching your search. Try adjusting your filters or search terms.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSearchQuery("");
                setSearchField("title");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          asChild
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-primary/25 transition-transform hover:scale-105"
        >
          <Link href="/dashboard/create-blog">
            <Plus className="h-8 w-8" />
            <span className="sr-only">Create New Post</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}