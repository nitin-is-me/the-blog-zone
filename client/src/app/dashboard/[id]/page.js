'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import DOMPurify from "isomorphic-dompurify";
import { stripHtml } from "@/utils/stripHtml";
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
import { ArrowLeft, Send, Trash2, Calendar, User, Clock, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const buildCommentTree = (flatComments) => {
  const commentMap = {};
  const rootComments = [];
  flatComments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });
  flatComments.forEach((comment) => {
    if (comment.parentId) {
      if (commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(commentMap[comment.id]);
      }
    } else {
      rootComments.push(commentMap[comment.id]);
    }
  });
  return rootComments;
};

const CommentNode = ({ comment, loggedInUser, deletingCommentId, onDelete, onReply, level = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText("");
      setIsReplying(false);
    } catch (error) { }
    setIsSubmitting(false);
  };

  return (
    <div className={`mt-4 ${level > 0 ? 'ml-4 sm:ml-8 border-l-2 border-indigo-100 dark:border-indigo-900/50 pl-4' : ''}`}>
      <Card className="bg-card/30 border-muted">
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
            <div className="flex items-center gap-1">
              {loggedInUser && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary h-8 w-8"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              )}
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
                      <AlertDialogAction onClick={() => onDelete(comment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed pl-11">
            {comment.content}
          </p>

          {isReplying && (
            <div className="pl-11 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <form onSubmit={submitReply} className="space-y-3">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[80px] text-sm resize-y bg-background"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsReplying(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={isSubmitting || !replyText.trim()}>
                    {isSubmitting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Send className="mr-2 h-3 w-3" />}
                    Reply
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map(reply => (
            <CommentNode
              key={reply.id}
              comment={reply}
              loggedInUser={loggedInUser}
              deletingCommentId={deletingCommentId}
              onDelete={onDelete}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");
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

  const handleSummarize = async () => {
    if (!post || !post.content) return;
    setIsSummarizing(true);
    setSummaryError("");
    try {
      const strippedContent = stripHtml(post.content);
      const response = await axios.post("https://the-blog-zone-server.vercel.app/api/ai/summarize", {
        content: strippedContent
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error(error);
      setSummaryError("Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const submitNewComment = async (content, parentId = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to comment.");
        throw new Error("Unauthorized");
      }
      await axios.post(
        `https://the-blog-zone-server.vercel.app/api/blog/${id}/comments`,
        { content, parentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Fetch updated comments
      const commentResponse = await axios.get(`https://the-blog-zone-server.vercel.app/api/blog/${id}`);
      setComments(commentResponse.data.Comments || []);
      toast.success(parentId ? "Reply posted!" : "Comment posted!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit comment.");
      throw error;
    }
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
      await submitNewComment(newComment, null);
      setNewComment("");
    } catch (error) { }
    setIsSubmitting(false);
  };

  const handleReplySubmit = async (parentId, replyText) => {
    await submitNewComment(replyText, parentId);
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

              {!summary && (
                <div className="flex justify-center sm:justify-start mt-6">
                  <Button onClick={handleSummarize} disabled={isSummarizing} variant="outline" className="gap-2 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-all">
                    {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isSummarizing ? 'Summarizing...' : 'Summarize with AI'}
                  </Button>
                </div>
              )}
              {summaryError && <p className="text-red-500 text-sm mt-2 text-center sm:text-left">{summaryError}</p>}
              {summary && (
                <div className="mt-8 p-6 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl animate-in slide-in-from-top-4 duration-500 fade-in text-left">
                  <h4 className="flex items-center font-semibold text-indigo-700 dark:text-indigo-400 mb-4 text-lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI Summary
                  </h4>
                  <ul className="space-y-3">
                    {summary.split('\n').filter(line => line.trim().length > 0).map((line, idx) => (
                      <li key={idx} className="text-muted-foreground text-sm sm:text-base leading-relaxed flex items-start">
                        <span className="text-indigo-400 mr-2 mt-0.5">•</span>
                        <span>{line.replace(/^-\s*/, '').trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* post content */}
            <Card className="border-none shadow-none bg-transparent">
              <CardContent
                className="p-0 text-lg leading-relaxed text-foreground/90 prose prose-sm sm:prose-base dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
              />
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
                {buildCommentTree(Comments).length > 0 ? (
                  buildCommentTree(Comments).map((comment) => (
                    <CommentNode
                      key={comment.id}
                      comment={comment}
                      loggedInUser={loggedInUser}
                      deletingCommentId={deletingCommentId}
                      onDelete={handleDeleteComment}
                      onReply={handleReplySubmit}
                      level={0}
                    />
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
