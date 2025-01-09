import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Paperclip, Smile, Bold, Italic, Code, Link as LinkIcon, List, ListOrdered } from 'lucide-react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Editor } from '@tiptap/core'

interface MessageInputProps {
  onSendMessage: (content: string, attachments: File[]) => void;
  replyingTo: string | null;
  onCancelReply: () => void;
  placeholder?: string;
}

export function MessageInput({ onSendMessage, replyingTo, onCancelReply, placeholder = "Type a message..." }: MessageInputProps) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const handleSubmit = useCallback((editor: Editor | null) => {
    if (!editor) return;
    
    const htmlContent = editor.getHTML();
    if (htmlContent.trim() || attachments.length > 0) {
      onSendMessage(htmlContent, attachments);
      editor.commands.clearContent();
      setContent('');
      setAttachments([]);
    }
  }, [attachments, onSendMessage]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 10,
          newGroupDelay: 300,
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[60px] px-3 py-2',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && event.shiftKey) {
          event.preventDefault();
          handleSubmit(editor);
          return true;
        }
        return false;
      },
    },
  });

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(editor);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onEmojiSelect = (emoji: any) => {
    if (editor) {
      editor.commands.insertContent(emoji.native);
    }
  };

  const handleSetLink = () => {
    if (editor && linkUrl.trim()) {
      if (editor.state.selection.empty) {
        // If no text is selected, insert new link with text
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${linkUrl.trim()}">${linkText.trim() || linkUrl.trim()}</a>`)
          .run();
      } else {
        // If text is selected, convert it to link
        editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      }
    }
    setLinkUrl('');
    setLinkText('');
    setIsLinkDialogOpen(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <form onSubmit={onFormSubmit} className="p-4 border-t">
      {replyingTo && (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2">
          <span className="text-sm text-gray-600">Replying to: {replyingTo}</span>
          <Button variant="ghost" size="sm" onClick={onCancelReply}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="rounded-lg border bg-card">
        <div className="flex gap-1 p-1 border-b">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-accent' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-accent' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-accent' : ''}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsLinkDialogOpen(true)}
            className={editor.isActive('link') ? 'bg-accent' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-accent' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-accent' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Picker 
                data={data} 
                onEmojiSelect={onEmojiSelect}
                theme="light"
              />
            </PopoverContent>
          </Popover>
          <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button type="submit" size="sm">Send</Button>
        </div>
        <EditorContent editor={editor} />
        <div className="text-xs text-muted-foreground text-right px-3 py-1">
          Press Shift + Enter to send
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      {attachments.length > 0 && (
        <div className="mt-2 space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="text-sm">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const nextInput = e.currentTarget.nextElementSibling as HTMLInputElement;
                    if (nextInput) {
                      nextInput.focus();
                    } else {
                      handleSetLink();
                    }
                  }
                }}
              />
              <Input
                placeholder="Link text (optional)..."
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSetLink();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setLinkUrl('');
              setLinkText('');
              setIsLinkDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSetLink}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

