import { useState, KeyboardEvent } from 'react'
import { Search, ArrowLeft, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'

interface SearchResult {
  messages: Array<{
    message: {
      id: string
      content: string
      createdAt: Date
      parentMessageId?: string | null
      sender: {
        id: string
        name: string
        avatar: string
      }
    }
    channel: {
      id: string
      name: string
    }
  }>
  files: Array<{
    attachment: {
      id: string
      filename: string
      fileUrl: string
      contentType: string
    }
    message: {
      id: string
      content: string
      createdAt: Date
      parentMessageId?: string | null
      sender: {
        id: string
        name: string
      }
    }
    channel: {
      id: string
      name: string
    }
  }>
}

interface SearchBarProps {
  onSelectChannel: (channelId: string, keepThread?: boolean) => void
  onOpenThread: (messageId: string) => void
}

export function SearchBar({ onSelectChannel, onOpenThread }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<SearchResult>({ messages: [], files: [] })
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setIsSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const handleBack = () => {
    setShowResults(false)
    setQuery('')
    setResults({ messages: [], files: [] })
  }

  const handleMessageClick = (result: SearchResult['messages'][0]) => {
    if (result.message.parentMessageId) {
      onSelectChannel(result.channel.id, true)
      onOpenThread(result.message.parentMessageId)
    }
    else {
      onSelectChannel(result.channel.id, true)
      onOpenThread(result.message.id)
    }
    
    handleBack()
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50">
        <div className="h-full max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-4 border-b border-gray-700">
            <Button variant="ghost" size="icon" onClick={handleBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-lg font-medium text-white">Search Results for "{query}"</h2>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-64px)] py-6">
            <div className="space-y-8">
              {results.messages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Messages</h3>
                  <div className="space-y-2">
                    {results.messages.map((result) => (
                      <div
                        key={result.message.id}
                        className="p-4 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleMessageClick(result)}
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                          <span>{result.message.sender.name}</span>
                          <span>•</span>
                          <span>#{result.channel.name}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(result.message.createdAt))} ago</span>
                          {result.message.parentMessageId && (
                            <>
                              <span>•</span>
                              <span className="text-gray-400">in thread</span>
                            </>
                          )}
                        </div>
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert text-white"
                          dangerouslySetInnerHTML={{ __html: result.message.content }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Files</h3>
                  <div className="space-y-2">
                    {results.files.map((result) => (
                      <div
                        key={result.attachment.id}
                        className="p-4 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              if (result.message.parentMessageId) {
                                onSelectChannel(result.channel.id, true)
                                onOpenThread(result.message.parentMessageId)
                              } else {
                                onSelectChannel(result.channel.id, true)
                                onOpenThread(result.message.id)
                              }
                              handleBack()
                            }}
                          >
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                              <span>{result.message.sender.name}</span>
                              <span>•</span>
                              <span>#{result.channel.name}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(result.message.createdAt))} ago</span>
                              {result.message.parentMessageId && (
                                <>
                                  <span>•</span>
                                  <span className="text-gray-400">in thread</span>
                                </>
                              )}
                            </div>
                            <div 
                              className="prose prose-sm max-w-none dark:prose-invert text-white mb-2"
                              dangerouslySetInnerHTML={{ __html: result.message.content }}
                            />
                            <p className="text-sm font-medium text-white">{result.attachment.filename}</p>
                          </div>
                          <a
                            href={result.attachment.fileUrl}
                            download={result.attachment.filename}
                            className="ml-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.messages.length === 0 && results.files.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No results found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border-b border-gray-700 bg-gray-800 relative z-10">
      <div className="flex items-center h-14 px-4 gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search messages and files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-gray-400"
        />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="text-gray-400 hover:text-white"
        >
          Search
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        Press &quot;/&quot; to open search
      </div>
    </div>
  )
}

