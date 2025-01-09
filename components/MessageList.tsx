import { ScrollArea } from "@/components/ui/scroll-area"
import { Message, User, Reaction } from "@/types/dataStructures"
import { ReactionPicker } from "./ReactionPicker"
import { FileAttachment } from "./FileAttachment"
import { CircleStatus } from "@/components/ui/circle-status"
import { MoreHorizontal, Pencil, Trash2, Hash, Users } from "lucide-react"
import { getChannelDisplayName } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"
import { MessageInput } from "./MessageInput"
import { Button } from "@/components/ui/button"

interface MessageListProps {
  messages: Message[];
  users: User[];
  reactions: Reaction[];
  onReply: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onOpenThread: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  currentUserId: string;
  onSendMessage: (content: string, attachments: File[]) => void;
  channelName?: string;
  channelId?: string;
  isDM?: boolean;
}

export function MessageList({ 
  messages, 
  users, 
  reactions, 
  onReply, 
  onReact, 
  onOpenThread,
  onEditMessage,
  onDeleteMessage,
  currentUserId,
  onSendMessage,
  channelName,
  channelId,
  isDM
}: MessageListProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const getReactionCounts = (messageId: string) => {
    return reactions
      .filter((r) => r.messageId === messageId)
      .reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  };

  const handleEditSubmit = async (messageId: string, content: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error("Failed to update message:", data.error || "Unknown error");
        return;
      }
      
      if (data.success) {
        onEditMessage(messageId, content);
      }
    } catch (error) {
      console.error("Error updating message:", error);
    } finally {
      setEditingMessageId(null);
    }
  };

  const topLevelMessages = messages.filter((m) => !m.parentMessageId);

  const handleDelete = async (messageId: string) => {
    console.log('Starting delete for messageId:', messageId);
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      console.log('Delete response status:', res.status);
      
      const data = await res.json();
      console.log('Delete response data:', data);
      
      if (!res.ok) {
        console.error("Delete failed:", data.error, data.details);
        // Maybe show an error toast here
        return;
      }
      
      onDeleteMessage(messageId);
      console.log('Called onDeleteMessage with:', messageId);
    } catch (error) {
      console.error('Delete request failed:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      {channelName && (
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isDM ? (
              <Users className="h-5 w-5" />
            ) : (
              <Hash className="h-5 w-5" />
            )}
            <h2 className="text-xl font-semibold">
              {isDM ? getChannelDisplayName({ 
                name: channelName, 
                isDM, 
                memberIds: messages.map(m => m.senderId).filter((id, i, arr) => arr.indexOf(id) === i)
              }, currentUserId, users) : channelName}
            </h2>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {topLevelMessages.map((message) => {
            const sender = users.find((user) => user.id === message.senderId);
            const reactionCounts = getReactionCounts(message.id);
            const replies = messages.filter(m => m.parentMessageId === message.id);
            const latestReply = replies.length > 0 ? replies[replies.length - 1] : null;
            const isCurrentUserMessage = message.senderId === currentUserId;

            if (editingMessageId === message.id) {
              return (
                <div key={message.id} className="mb-4 ml-8">
                  <MessageInput
                    onSendMessage={(content) => handleEditSubmit(message.id, content)}
                    replyingTo={null}
                    onCancelReply={() => setEditingMessageId(null)}
                    initialContent={message.content}
                    placeholder="Edit message..."
                  />
                </div>
              );
            }

            return (
              <div key={message.id} className="mb-4">
                <div className="flex items-start space-x-2">
                  <div className="relative">
                    <span className="text-2xl">{sender?.avatar}</span>
                    <CircleStatus isOnline={sender?.isOnline} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">{sender?.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                      {message.editedAt && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-xs text-gray-400 ml-2 italic cursor-help">
                                (edited)
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edited at {new Date(message.editedAt).toLocaleString()}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {isCurrentUserMessage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-accent"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => setEditingMessageId(message.id)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => onDeleteMessage(message.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {message.isDeleted ? (
                      <div className="italic text-gray-500">This message was deleted</div>
                    ) : (
                      <>
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                        {message.attachments && message.attachments.map((attachment) => (
                          <FileAttachment key={attachment.id} attachment={attachment} />
                        ))}
                      </>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="flex flex-wrap gap-1 items-center">
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <div
                            key={emoji}
                            onClick={() => onReact(message.id, emoji)}
                            className="rounded-full px-2 py-0.5 text-sm bg-gray-100 hover:bg-gray-200 cursor-pointer"
                          >
                            {emoji} {count}
                          </div>
                        ))}
                        <ReactionPicker onReact={(emoji) => onReact(message.id, emoji)} />
                      </div>
                      {!message.isDeleted && (
                        <div
                          onClick={() => onOpenThread(message.id)}
                          className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          Reply in Thread
                        </div>
                      )}
                    </div>
                    {replies.length > 0 && (
                      <div className="mt-2 bg-gray-100 p-2 rounded-md cursor-pointer" onClick={() => onOpenThread(message.id)}>
                        <div className="text-sm text-gray-600">{replies.length} replies</div>
                        {latestReply && !latestReply.isDeleted && (
                          <div className="text-sm">
                            <span className="font-semibold">{users.find(u => u.id === latestReply.senderId)?.name}: </span>
                            <span dangerouslySetInnerHTML={{ __html: latestReply.content }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <MessageInput
          onSendMessage={onSendMessage}
          replyingTo={null}
          onCancelReply={() => {}}
          placeholder="Type a message... (Shift + Enter to send)"
        />
      </div>
    </div>
  );
}