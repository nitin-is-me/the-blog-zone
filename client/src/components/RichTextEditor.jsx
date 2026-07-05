'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  X,
  Image as ImageIcon,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { AiWarningDialog } from './AiWarningDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';

const MenuBar = ({ editor }) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('improve_writing');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [isWarningSuppressed, setIsWarningSuppressed] = useState(true);
  const [isPrivacyWarningOpen, setIsPrivacyWarningOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:8000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setIsWarningSuppressed(res.data.isWarningSuppressed))
        .catch(err => console.error("Failed to check privacy preference"));
    }
  }, []);

  if (!editor) {
    return null;
  }

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');

    const { from, to } = editor.state.selection;
    if (from !== to) {
      setLinkText(editor.state.doc.textBetween(from, to, ' '));
    } else {
      setLinkText('');
    }

    setIsLinkModalOpen(true);
  };

  const handleLinkSubmit = (e) => {
    if (e) e.preventDefault();
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      // Prepend https:// if it doesn't have a standard protocol
      if (!/^https?:\/\//i.test(finalUrl) && !/^(mailto|tel):/i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }

      const { from, to } = editor.state.selection;
      if (from === to && linkText) {
        // if no text is selected but user provided link text, insert it
        editor.chain().focus().insertContent(`<a href="${finalUrl}" class="text-primary underline underline-offset-4">${linkText}</a>`).run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
      }
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: blobUrl }).run();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAiImprove = async () => {
    const { from, to } = editor.state.selection;
    if (from === to) {
      toast.error('Please highlight some text first.');
      setIsAiModalOpen(false);
      return;
    }
    const text = editor.state.doc.textBetween(from, to, ' ');

    setIsAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/ai/improve-text',
        { text, prompt: aiPrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newText = response.data.result;
      editor.chain().focus().insertContentAt({ from, to }, newText).run();
      toast.success('Text improved!');
      setIsAiModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to improve text');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border border-t-0 rounded-b-md bg-muted/40">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        className={editor.isActive('bold') ? 'bg-muted shadow-sm' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        className={editor.isActive('italic') ? 'bg-muted shadow-sm' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
        className={editor.isActive('strike') ? 'bg-muted shadow-sm' : ''}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-muted shadow-sm' : ''}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted shadow-sm' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        className={editor.isActive('bulletList') ? 'bg-muted shadow-sm' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={editor.isActive('orderedList') ? 'bg-muted shadow-sm' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          openLinkModal();
        }}
        className={editor.isActive('link') ? 'bg-muted shadow-sm' : ''}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().unsetLink().run();
        }}
        disabled={!editor.isActive('link')}
      >
        <Unlink className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isUploading}
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          if (!isWarningSuppressed) {
            setIsPrivacyWarningOpen(true);
          } else {
            setIsAiModalOpen(true);
          }
        }}
        className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
      >
        <Sparkles className="h-4 w-4 mr-1" />
        AI
      </Button>

      <AiWarningDialog 
        open={isPrivacyWarningOpen} 
        onOpenChange={setIsPrivacyWarningOpen}
        onConfirm={() => {
          setIsWarningSuppressed(true);
          setIsAiModalOpen(true);
        }}
      />

      {/* Custom Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Link</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsLinkModalOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkText">Text to display</Label>
                <Input
                  id="linkText"
                  placeholder="e.g. Click here"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit(e)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit(e)}
                  type="url"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsLinkModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleLinkSubmit}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                Improve Text
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAiModalOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Highlight some text in your editor, then select how you want to improve it.
              </p>

              <div className="space-y-2">
                <Label>Action</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                >
                  <option value="improve_writing">Improve Writing</option>
                  <option value="make_concise">Make Concise</option>
                  <option value="simplify">Simplify</option>
                  <option value="make_engaging">Make Engaging</option>
                  <option value="expand">Expand</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAiModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAiImprove} disabled={isAiLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isAiLoading ? 'Improving...' : 'Apply'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full my-4 border',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[300px] border rounded-t-md p-4 bg-background max-w-none',
      },
    },
  });

  return (
    <div className="w-full flex flex-col">
      <EditorContent editor={editor} />
      <MenuBar editor={editor} />
    </div>
  );
}
