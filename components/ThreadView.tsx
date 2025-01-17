import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message, User, Reaction } from "@/types/dataStructures"
import { ReactionPicker } from "./ReactionPicker"
import { Button } from "@/components/ui/button"
import { X, MoreHorizontal, Pencil, Trash2, PlayCircle, Loader2, PauseCircle, Speaker } from 'lucide-react'
import { MessageInput } from "./MessageInput"
import { FileAttachment } from "./FileAttachment"
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

interface ThreadViewProps {
  parentMessage: Message;
  replies: Message[];
  users: User[];
  reactions: Reaction[];
  onClose: () => void;
  onReply: (content: string, attachments: File[], parentMessageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  currentUserId: string;
}

export function ThreadView({ 
  parentMessage, 
  replies, 
  users, 
  reactions, 
  onClose, 
  onReply, 
  onReact,
  onEditMessage,
  onDeleteMessage,
  currentUserId
}: ThreadViewProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<Record<string, { url: string | null; isPlaying: boolean }>>({}); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all audio URLs
      Object.values(audioStates).forEach(state => {
        if (state.url) URL.revokeObjectURL(state.url);
      });
    };
  }, [audioStates]);

  if (!parentMessage) {
    return <div className="p-4">No parent message found.</div>
  }

  const handlePlayTTS = async (messageId: string, text: string) => {
    try {
      // If already has audio URL
      if (audioStates[messageId]?.url) {
        if (audioStates[messageId].isPlaying) {
          // Pause current playback
          audioRef.current?.pause();
          setAudioStates(prev => ({
            ...prev,
            [messageId]: { ...prev[messageId], isPlaying: false }
          }));
          setPlayingMessageId(null);
        } else {
          // Resume or start new playback
          if (playingMessageId && playingMessageId !== messageId) {
            audioRef.current?.pause();
            setAudioStates(prev => ({
              ...prev,
              [playingMessageId]: { ...prev[playingMessageId], isPlaying: false }
            }));
          }
          
          if (!audioRef.current || audioRef.current.src !== audioStates[messageId].url) {
            audioRef.current = new Audio(audioStates[messageId].url!);
            audioRef.current.onended = () => {
              setAudioStates(prev => ({
                ...prev,
                [messageId]: { ...prev[messageId], isPlaying: false }
              }));
              setPlayingMessageId(null);
            };
          }
          
          audioRef.current.play();
          setAudioStates(prev => ({
            ...prev,
            [messageId]: { ...prev[messageId], isPlaying: true }
          }));
          setPlayingMessageId(messageId);
        }
        return;
      }

      // Generate new audio
      setLoadingMessageId(messageId);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, messageId }),
      });

      if (!res.ok) throw new Error('TTS failed');

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Stop any current playback
      if (playingMessageId) {
        audioRef.current?.pause();
        setAudioStates(prev => ({
          ...prev,
          [playingMessageId]: { ...prev[playingMessageId], isPlaying: false }
        }));
      }

      // Setup new audio
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setAudioStates(prev => ({
          ...prev,
          [messageId]: { ...prev[messageId], isPlaying: false }
        }));
        setPlayingMessageId(null);
      };

      // Start playback
      audioRef.current.play();
      setAudioStates(prev => ({
        ...prev,
        [messageId]: { url: audioUrl, isPlaying: true }
      }));
      setPlayingMessageId(messageId);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setLoadingMessageId(null);
    }
  };

  const handleReply = (content: string, attachments: File[]) => {
    onReply(content, attachments, parentMessage.id);
  };

  const handleEditSubmit = (messageId: string, content: string) => {
    onEditMessage(messageId, content);
    setEditingMessageId(null);
  };

  const renderMessage = (message: Message) => {
    const sender = users.find((user) => user.id === message.senderId);
    const messageReactions = reactions.filter(r => r.messageId === message.id);
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
          <div className="text-2xl">{sender?.avatar}</div>
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-semibold mr-2">{sender?.name}</span>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleString()}
              </span>
              {message.editedAt && (
                <span className="text-xs text-gray-500 ml-2">(edited)</span>
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
                {(message.attachments ?? []).map((attachment) => (
                  <FileAttachment key={attachment.id} attachment={attachment} />
                ))}
              </>
            )}
            <div className="flex items-center space-x-2 mt-2">
              {!message.isDeleted && <ReactionPicker onReact={(emoji) => onReact(message.id, emoji)} />}
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
            {!message.isDeleted && (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-0"
                  onClick={() => handlePlayTTS(message.id, message.content)}
                >
                  {loadingMessageId === message.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : audioStates[message.id]?.isPlaying ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                </Button>
                {audioStates[message.id]?.url && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Speaker className="h-4 w-4 text-muted-foreground ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Audio cached</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
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
          placeholder="Reply in thread... (Shift + Enter to send)"
        />
      </div>
    </div>
  );
}

