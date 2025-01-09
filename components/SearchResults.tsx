import { Message, Channel, User, Attachment } from "@/types/dataStructures"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileIcon, MessageSquare } from 'lucide-react'

interface SearchResultsProps {
  results: {
    messages: { message: Message; channel: Channel }[];
    files: { attachment: Attachment; message: Message; channel: Channel }[];
  };
  users: User[];
  onSelectResult: (channelId: string, messageId: string) => void;
}

export function SearchResults({ results, users, onSelectResult }: SearchResultsProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      {/* Messages Section */}
      {results.messages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Messages
          </h2>
          <div className="space-y-4">
            {results.messages.map(({ message, channel }) => {
              const sender = users.find(u => u.id === message.senderId);
              return (
                <div
                  key={message.id}
                  className="p-3 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => onSelectResult(channel.id, message.id)}
                >
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <span className="font-medium text-gray-700">{channel.name}</span>
                    <span className="mx-2">•</span>
                    <span>{sender?.name}</span>
                  </div>
                  <div className="text-gray-900">{message.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Section */}
      {results.files.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileIcon className="mr-2 h-5 w-5" />
            Files
          </h2>
          <div className="space-y-4">
            {results.files.map(({ attachment, message, channel }) => {
              const sender = users.find(u => u.id === message.senderId);
              const isImage = attachment.contentType.startsWith('image/');
              
              return (
                <div
                  key={attachment.id}
                  className="p-3 hover:bg-gray-100 rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onSelectResult(channel.id, message.id)}
                    >
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <span className="font-medium text-gray-700">{channel.name}</span>
                        <span className="mx-2">•</span>
                        <span>{sender?.name}</span>
                      </div>
                      <div className="flex items-center">
                        {isImage ? (
                          <img 
                            src={attachment.fileUrl} 
                            alt={attachment.filename}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                        ) : (
                          <FileIcon className="w-10 h-10 p-2 bg-gray-100 rounded mr-3" />
                        )}
                        <span className="text-gray-900">{attachment.filename}</span>
                      </div>
                    </div>
                    <a
                      href={attachment.fileUrl}
                      download={attachment.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      onClick={e => e.stopPropagation()}
                    >
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.messages.length === 0 && results.files.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No results found
        </div>
      )}
    </ScrollArea>
  );
}

