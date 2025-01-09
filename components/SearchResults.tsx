import { ScrollArea } from "@/components/ui/scroll-area"
import { Message, User, Channel } from "@/types/dataStructures"

interface SearchResult {
  message: Message;
  channel: Channel;
}

interface SearchResultsProps {
  results: SearchResult[];
  users: User[];
  onSelectResult: (channelId: string, messageId: string) => void;
}

export function SearchResults({ results, users, onSelectResult }: SearchResultsProps) {
  return (
    <ScrollArea className="h-[calc(100vh-120px)] w-full max-w-md border rounded-md shadow-lg bg-white">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Search Results</h2>
        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          results.map((result) => (
            <div
              key={result.message.id}
              className="mb-4 p-2 border rounded cursor-pointer hover:bg-gray-100"
              onClick={() => onSelectResult(result.channel.id, result.message.id)}
            >
              <div className="flex items-center mb-2">
                <span className="font-semibold mr-2">
                  {users.find(u => u.id === result.message.senderId)?.name}
                </span>
                <span className="text-sm text-gray-500">
                  in {result.channel.name}
                </span>
              </div>
              <p className="text-sm">{result.message.content}</p>
              {result.message.attachments && result.message.attachments.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Attachments: {result.message.attachments.map(a => a.filename).join(', ')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

