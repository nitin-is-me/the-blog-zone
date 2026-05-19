'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { formatTimeAgo } from "../../utils/formatTime";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Trash2, Calendar, User, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function BlogPostPage() {
  const [post, setPost] = useState(null);
  const [postLoading, setPostLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState("");
  const [Comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get(`https://the-blog-zone-server.vercel.app/api/blog/${id}`);
        setPost(response.data);
        setComments(response.data.Comments || []);
      } catch (error) {
        setError("Failed to fetch the blog post.");
        toast.error("Failed to fetch the blog post.");
      } finally {
        setPostLoading(false);
      }
    };

    const fetchLoggedInUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLoggedInUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user data.");
        } finally {
          setUserLoading(false);
        }
      } else {
        setUserLoading(false);
      }
    };

    fetchPost();
    fetchLoggedInUser();
  }, [id]);

  let overallLoading = postLoading || userLoading;

  const handleBack = () => {
    // router.push("/dashboard");
    router.back();
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    setCommentError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCommentError("You must be logged in to comment.");
        return;
      }
      const response = await axios.post(
        `https://the-blog-zone-server.vercel.app/api/blog/${id}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Fetch updated comments
      const commentResponse = await axios.get(`https://the-blog-zone-server.vercel.app/api/blog/${id}`);
      setComments(commentResponse.data.Comments);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (error) {
      setCommentError(error?.response?.data?.message || "Failed to submit comment.");
      toast.error("Failed to submit comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {


    setDeletingCommentId(commentId);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://the-blog-zone-server.vercel.app/api/blog/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
      toast.success("Comment deleted.");
    } catch (error) {
      toast.error("Failed to delete the comment.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (overallLoading) {
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
        {/* header */}
        <div className="flex items-center">
          <Button variant="ghost" className="gap-2" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center border border-destructive/20">
            {error}
          </div>
        )}

        {post && (
          <article className="space-y-6 animate-in fade-in duration-500">
            {/* post header */}
            <div className="space-y-4 text-center sm:text-left">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <Link
                    href={post.Blogger.username === loggedInUser?.username ? "/profile" : `/profile/${post.Blogger.username}`}
                    className="font-medium text-foreground hover:underline hover:text-primary transition-colors"
                  >
                    {post.Blogger.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* post content */}
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {post.content}
              </CardContent>
            </Card>

            <Separator className="my-8" />

            {/* comments */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Comments</h2>
                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-sm font-medium">
                  {Comments.length}
                </span>
              </div>

              {/* comment from */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 space-y-4">
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="min-h-[100px] resize-y bg-background"
                    />
                    {commentError && <p className="text-sm text-destructive">{commentError}</p>}
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Post Comment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* all comments */}
              <div className="space-y-4">
                {Comments.length > 0 ? (
                  Comments.map((comment) => (
                    <Card key={comment.id} className="bg-card/30 border-muted">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {comment.Blogger?.name?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold">
                                {comment.Blogger ? (
                                  <Link
                                    href={comment.Blogger.username === loggedInUser?.username ? "/profile" : `/profile/${comment.Blogger.username}`}
                                    className="hover:underline hover:text-primary transition-colors"
                                  >
                                    {comment.Blogger.name}
                                  </Link>
                                ) : "Anonymous"}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</p>
                            </div>
                          </div>
                          {loggedInUser?.username === comment.Blogger?.username && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive h-8 w-8"
                                  disabled={deletingCommentId === comment.id}
                                >
                                  {deletingCommentId === comment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this comment?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed pl-11">
                          {comment.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No comments yet. Be the first to start the conversation!</p>
                  </div>
                )}
              </div>
            </section>
          </article>
        )}
      </div>
    </div>
  );
}
