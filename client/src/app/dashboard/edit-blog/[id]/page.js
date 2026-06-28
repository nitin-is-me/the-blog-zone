'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { toast } from 'sonner';

export default function EditBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    // Fetch the existing post details
    const fetchPost = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setError("You must be logged in to edit post");
        toast.error("You must be logged in to edit post");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const post = response.data;
        setTitle(post.title);
        setContent(post.content);
        setIsPrivate(post.private);
        if (post.thumbnail) {
          setSelectedThumbnail(post.thumbnail);
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to fetch post details.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const availableImages = useMemo(() => {
    if (!content) return [];
    const urls = [];
    const regex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      urls.push(match[1]);
    }
    return urls;
  }, [content]);

  useEffect(() => {
    if (availableImages.length > 0) {
      if (!selectedThumbnail || !availableImages.includes(selectedThumbnail)) {
        setSelectedThumbnail(availableImages[0]);
      }
    } else {
      setSelectedThumbnail(null);
    }
  }, [availableImages, selectedThumbnail]);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to edit a post.');
        toast.error('You must be logged in to edit a post.');
        return;
      }

      setIsSubmitting(true);
      
      await axios.put(
        `http://localhost:8000/api/blog/edit/${id}`,
        { title, content, private: isPrivate, thumbnail: selectedThumbnail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Post updated successfully!");
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to update the blog post.');
      toast.error('Failed to update the blog post.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-3xl shadow-lg border-none bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-6 top-6 gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <CardTitle className="text-3xl font-bold text-center pt-8">Edit Post</CardTitle>
          <CardDescription className="text-center">
            Make changes to your story
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="edit-post-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter an engaging title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-lg font-medium"
              />
            </div>

            {availableImages.length > 0 && (
              <div className="space-y-2">
                <Label className="text-lg">Select Thumbnail Cover</Label>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {availableImages.map((url, idx) => (
                    <div 
                      key={idx} 
                      className={`relative w-32 h-24 shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedThumbnail === url ? 'border-primary ring-2 ring-primary/50' : 'border-transparent hover:border-primary/50'}`}
                      onClick={() => setSelectedThumbnail(url)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Thumbnail option ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg">Content</Label>
              <RichTextEditor
                value={content}
                onChange={(html) => setContent(html)}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-foreground">Private Post</Label>
                <p className="text-sm text-muted-foreground">
                  Only you will be able to see this post.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium">
                  {isPrivate ? "Private" : "Public"}
                </span>
              </div>
            </div>

            {/* notice for encryption of private posts */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-500/10 p-3 rounded text-indigo-400">
              <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                Private posts are securely encrypted. {' '}
                <Link
                  href="https://github.com/nitin-is-me/the-blog-zone-client/blob/master/README.md#private-posts-will-be-encrypted"
                  className="underline hover:text-primary transition-colors"
                  target='_blank'
                  rel='noopener noreferrer'>
                  Learn more.
                </Link>
              </div>
            </div>

          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t p-6">
          <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="edit-post-form" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
