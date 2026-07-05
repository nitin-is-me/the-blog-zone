'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import { processHtmlImages } from '@/utils/supabaseClient';
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

export default function CreateBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    router.push("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to create a post.');
        toast.error('You must be logged in to create a post.');
        setIsSubmitting(false);
        return;
      }

      const { html: processedContent, urlMap } = await processHtmlImages(content);

      let finalThumbnail = selectedThumbnail;
      if (selectedThumbnail && urlMap[selectedThumbnail]) {
        finalThumbnail = urlMap[selectedThumbnail];
      }

      await axios.post(
        'http://localhost:8000/api/blog/create',
        { title, content: processedContent, private: isPrivate, thumbnail: finalThumbnail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle('');
      setContent('');
      toast.success("Blog post created successfully!");
      router.push('/dashboard');
    } catch (error) {
      const errorMsg = 'Failed to create blog post.';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

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
          <CardTitle className="text-3xl font-bold text-center pt-8">Create New Post</CardTitle>
          <CardDescription className="text-center">
            Share your thoughts with the world
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="create-post-form" onSubmit={handleSubmit} className="space-y-6">
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

            {/* Encryption Notice */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-500/10 p-3 rounded text-indigo-400">
              <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                Private posts are securely encrypted. {' '}
                <Link
                  href="https://github.com/nitin-is-me/the-blog-zone-client/blob/master/README.md#private-posts-will-be-encrypted"
                  className="underline hover:text-primary transition-colors"
                  target='_blank'
                  rel='noopener noreferrer'>
                  Learn more about our security.
                </Link>
              </div>
            </div>

          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t p-6">
          <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-post-form" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Post"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
