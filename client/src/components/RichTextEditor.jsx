'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
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
  X
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MenuBar = ({ editor }) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

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

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border border-b-0 rounded-t-md bg-muted/40">
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
    </div>
  );
};

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
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
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[300px] border rounded-b-md p-4 bg-background max-w-none',
      },
    },
  });

  return (
    <div className="w-full flex flex-col">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
