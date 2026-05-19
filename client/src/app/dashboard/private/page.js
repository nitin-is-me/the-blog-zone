"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { formatTimeAgo } from "../../utils/formatTime";
import { useRouter } from "next/navigation";
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
import { Search, ChevronDown, ArrowLeft, X, Loader2, Calendar, Lock } from "lucide-react";
import { toast } from "sonner";

export default function PrivatePosts() {

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  // Search states
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("title");

  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      }
    };

    const fetchPrivatePosts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setError("You must be logged in to see your private posts");
        toast.error("You must be logged in to see your private posts");
        return;
      }
      try {
        const response = await axios.get("https://the-blog-zone-server.vercel.app/api/blog/blogs/private", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to fetch private posts.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchPrivatePosts();
  }, []);

  // filter posts based on search query and field
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
        default:
          return true;
      }
    });

    setFilteredPosts(filtered);
  }, [searchQuery, searchField, posts]);

  // reset search query when search panel is closed
  useEffect(() => {
    if (!isSearchVisible) {
      setSearchQuery("");
    }
  }, [isSearchVisible]);

  const handleBack = () => {
    router.push("/dashboard");
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading private posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              My Private Posts
            </h1>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className={isSearchVisible ? "bg-accent" : ""}
          >
            <Search className="h-5 w-5 mr-2" />
            {isSearchVisible ? "Close Search" : "Search"}
          </Button>
        </div>

        {isSearchVisible && (
          <div className="border-t bg-muted/30 px-4 py-4 animate-in slide-in-from-top-2">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search by ${searchField}...`}
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="max-w-3xl mx-auto mt-2 text-xs text-muted-foreground">
              {searchQuery ? `Found ${filteredPosts.length} results` : ""}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="p-4 mb-6 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground space-y-4">
              <div className="bg-muted/50 p-4 rounded-full">
                <Lock className="h-8 w-8 opacity-50" />
              </div>
              {searchQuery ? (
                <p>No private posts found matching "{searchQuery}"</p>
              ) : (
                <p>You haven't created any private posts yet.</p>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="flex flex-col overflow-hidden border-muted hover:shadow-lg transition-all hover:border-primary/20 bg-card/50 backdrop-blur-sm cursor-pointer group"
                onClick={() => router.push(`/dashboard/private/${post.id}`)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pb-4">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.content}
                  </p>
                </CardContent>

                <CardFooter className="pt-0 flex justify-between items-center bg-muted/20 px-6 py-4 mt-auto">
                  {currentUser?.username === post.Blogger.username && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/edit-blog/${post.id}`);
                        }}
                      >
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
                              This action cannot be undone. This will permanently delete your private post.
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
                    </>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}