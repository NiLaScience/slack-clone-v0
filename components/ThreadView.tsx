import { useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message, User, Reaction } from "@/types/dataStructures"
import { ReactionPicker } from "./ReactionPicker"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import { MessageInput } from "./MessageInput"
import { FileAttachment } from "./FileAttachment"

interface ThreadViewProps {
  parentMessage: Message;
  replies: Message[];
  users: User[];
  reactions: Reaction[];
  onClose: () => void;
  onReply: (content: string, parentMessageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

export function ThreadView({ parentMessage, replies, users, reactions, onClose, onReply, onReact }: ThreadViewProps) {
  if (!parentMessage) {
    return <div className="p-4">No parent message found.</div>
  }

  const handleReply = (content: string) => {
    onReply(content, parentMessage.id);
  };

  const renderMessage = (message: Message) => {
    const sender = users.find((user) => user.id === message.senderId);
    const messageReactions = reactions.filter(r => r.messageId === message.id);

    return (
      <div key={message.id} className="mb-4">
        <div className="flex items-start space-x-2">
          <div className="text-2xl">{sender?.avatar}</div>
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-semibold mr-2">{sender?.name}</span>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleString()}
              </span>
            </div>
            <div>{message.content}</div>
            {(message.attachments ?? []).map((attachment) => (
              <FileAttachment key={attachment.id} attachment={attachment} />
            ))}
            <div className="flex items-center space-x-2 mt-2">
              <ReactionPicker onReact={(emoji) => onReact(message.id, emoji)} />
            </div>
            {messageReactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(messageReactions.reduce((acc, reaction) => {
                  acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)).map(([emoji, count]) => (
                  <span key={emoji} className="bg-gray-100 rounded-full px-2 py-1 text-sm">
                    {emoji} {count > 1 && count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-l p-4">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Thread</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4">
        {renderMessage(parentMessage)}
        <div className="ml-8 mt-4 border-t pt-4">
          {replies.map(renderMessage)}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <MessageInput
          onSendMessage={handleReply}
          replyingTo={null}
          onCancelReply={() => {}}
          placeholder="Reply in thread..."
        />
      </div>
    </div>
  );
}

