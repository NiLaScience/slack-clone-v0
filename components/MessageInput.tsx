import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Paperclip } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string, attachments: File[]) => void;
  replyingTo: string | null;
  onCancelReply: () => void;
  placeholder?: string;
}

export function MessageInput({ onSendMessage, replyingTo, onCancelReply, placeholder = "Type a message..." }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      {replyingTo && (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2">
          <span className="text-sm text-gray-600">Replying to: {replyingTo}</span>
          <Button variant="ghost" size="sm" onClick={onCancelReply}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-grow"
        />
        <div className="flex flex-col space-y-2">
          <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button type="submit">Send</Button>
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
    </form>
  );
}

