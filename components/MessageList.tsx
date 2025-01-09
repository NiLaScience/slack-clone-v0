import { ScrollArea } from "@/components/ui/scroll-area"
import { Message, User, Reaction } from "@/types/dataStructures"
import { ReactionPicker } from "./ReactionPicker"
import { FileAttachment } from "./FileAttachment"
import { CircleStatus } from "@/components/ui/circle-status"

interface MessageListProps {
  messages: Message[];
  users: User[];
  reactions: Reaction[];
  onReply: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onOpenThread: (messageId: string) => void;
}

export function MessageList({ messages, users, reactions, onReply, onReact, onOpenThread }: MessageListProps) {
  if (!messages || messages.length === 0) {
    return (
      <ScrollArea className="h-[calc(100vh-64px-80px)] p-4">
        <p>No messages yet.</p>
      </ScrollArea>
    );
  }

  const topLevelMessages = messages.filter(m => !m.parentMessageId);

  const getReactionCounts = (messageId: string) => {
    return reactions
      .filter(r => r.messageId === messageId)
      .reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
        return acc
      }, {} as Record<string, number>)
  }

  return (
    <ScrollArea className="h-[calc(100vh-64px-80px)] p-4">
      {topLevelMessages.map((message) => {
        const sender = users.find((user) => user.id === message.senderId);
        const reactionCounts = getReactionCounts(message.id);
        const replies = messages.filter(m => m.parentMessageId === message.id);
        const latestReply = replies.length > 0 ? replies[replies.length - 1] : null;

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
                </div>
                <div>{message.content}</div>
                {message.attachments && message.attachments.map((attachment) => (
                  <FileAttachment key={attachment.id} attachment={attachment} />
                ))}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex flex-wrap gap-1 items-center">
                    {Object.entries(reactionCounts).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => onReact(message.id, emoji)}
                        className="rounded-full px-2 py-0.5 text-sm bg-gray-100 hover:bg-gray-200"
                      >
                        {emoji} {count}
                      </button>
                    ))}
                    <ReactionPicker
                      onReact={(emoji) => onReact(message.id, emoji)}
                      trigger={
                        <button
                          className="rounded-full px-2 py-0.5 text-sm hover:bg-gray-100"
                        >
                          😀
                        </button>
                      }
                    />
                  </div>
                  <button
                    onClick={() => onOpenThread(message.id)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Reply in Thread
                  </button>
                </div>
                {replies.length > 0 && (
                  <div className="mt-2 bg-gray-100 p-2 rounded-md cursor-pointer" onClick={() => onOpenThread(message.id)}>
                    <div className="text-sm text-gray-600">{replies.length} replies</div>
                    {latestReply && (
                      <div className="text-sm">
                        <span className="font-semibold">{users.find(u => u.id === latestReply.senderId)?.name}: </span>
                        {latestReply.content}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </ScrollArea>
  );
}

