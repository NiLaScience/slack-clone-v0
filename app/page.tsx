'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MessageList } from '@/components/MessageList'
import { MessageInput } from '@/components/MessageInput'
import { ThreadView } from '@/components/ThreadView'
import { SearchBar } from '@/components/SearchBar'
import { SearchResults } from '@/components/SearchResults'
import { generateSampleData } from '@/utils/sampleDataGenerator'
import { User, Channel, Message, Reaction, Attachment } from '@/types/dataStructures'
import { CircleStatus } from '@/components/ui/circle-status'
import { Hash } from 'lucide-react'

export default function Page() {
  const [sampleData, setSampleData] = useState(() => {
    const data = generateSampleData()
    // Mark the first user as online
    data.users[0].isOnline = true
    return data
  })
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [openThreadId, setOpenThreadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    messages: { message: Message; channel: Channel }[];
    files: { attachment: Attachment; message: Message; channel: Channel }[];
  }>({ messages: [], files: [] })

  useEffect(() => {
    if (selectedChannelId) {
      setMessages(sampleData.messages.filter(m => m.channelId === selectedChannelId))
    } else if (selectedUserId) {
      const dmChannel = sampleData.channels.find(c => 
        c.isPrivate && c.name.includes(sampleData.users.find(u => u.id === selectedUserId)?.name || '')
      )
      setMessages(dmChannel ? sampleData.messages.filter(m => m.channelId === dmChannel.id) : [])
    } else {
      setMessages([])
    }
  }, [selectedChannelId, selectedUserId, sampleData])

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId)
    setSelectedUserId(null)
    setOpenThreadId(null)
    setSearchResults({ messages: [], files: [] })
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId)
    setSelectedChannelId(null)
    setOpenThreadId(null)
    setSearchResults({ messages: [], files: [] })
  }

  const handleSendMessage = async (content: string, attachments: File[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      channelId: selectedChannelId || 
        sampleData.channels.find(c => 
          c.isPrivate && c.name.includes(sampleData.users.find(u => u.id === selectedUserId)?.name || '')
        )?.id || '',
      senderId: sampleData.users[0].id, // Assuming the first user is the current user
      content,
      parentMessageId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
    }

    // Handle file uploads
    const uploadedAttachments: Attachment[] = await Promise.all(
      attachments.map(async (file) => {
        // In a real application, you would upload the file to a server here
        // For this example, we'll create a fake URL
        const fakeUrl = URL.createObjectURL(file);
        return {
          id: Date.now().toString(),
          messageId: newMessage.id,
          filename: file.name,
          fileUrl: fakeUrl,
          contentType: file.type,
          createdAt: new Date(),
        };
      })
    );

    newMessage.attachments = uploadedAttachments;

    setMessages(prev => [...prev, newMessage])
    setSampleData(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }))
  }

  const handleSendReply = async (content: string, attachments: File[], parentMessageId: string) => {
    const newReply: Message = {
      id: Date.now().toString(),
      channelId: selectedChannelId || 
        sampleData.channels.find(c => 
          c.isPrivate && c.name.includes(sampleData.users.find(u => u.id === selectedUserId)?.name || '')
        )?.id || '',
      senderId: sampleData.users[0].id, // Assuming the first user is the current user
      content,
      parentMessageId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
    }

    // Handle file uploads
    const uploadedAttachments: Attachment[] = await Promise.all(
      attachments.map(async (file) => {
        // In a real application, you would upload the file to a server here
        // For this example, we'll create a fake URL
        const fakeUrl = URL.createObjectURL(file);
        return {
          id: Date.now().toString(),
          messageId: newReply.id,
          filename: file.name,
          fileUrl: fakeUrl,
          contentType: file.type,
          createdAt: new Date(),
        };
      })
    );

    newReply.attachments = uploadedAttachments;

    setMessages(prev => [...prev, newReply])
    setSampleData(prev => ({
      ...prev,
      messages: [...prev.messages, newReply],
    }))
  }

  const handleCreateChannel = (name: string, isPrivate: boolean) => {
    const newChannel: Channel = {
      id: Date.now().toString(),
      name,
      isPrivate,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSampleData(prev => ({
      ...prev,
      channels: [...prev.channels, newChannel],
    }))
  }

  const handleReact = (messageId: string, emoji: string) => {
    setSampleData(prev => {
      const existingReaction = prev.reactions.find(r => r.messageId === messageId && r.userId === sampleData.users[0].id && r.emoji === emoji);
      if (existingReaction) {
        // Remove the reaction if it already exists
        return {
          ...prev,
          reactions: prev.reactions.filter(r => r.id !== existingReaction.id),
        };
      } else {
        // Add new reaction
        const newReaction: Reaction = {
          id: Date.now().toString(),
          messageId,
          userId: sampleData.users[0].id, // Assuming the first user is the current user
          emoji,
          createdAt: new Date(),
        };
        return {
          ...prev,
          reactions: [...prev.reactions, newReaction],
        };
      }
    });
  };

  const handleOpenThread = (messageId: string) => {
    setOpenThreadId(messageId)
  }

  const handleCloseThread = () => {
    setOpenThreadId(null)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const messageResults = sampleData.messages
      .filter(message => message.content.toLowerCase().includes(query.toLowerCase()))
      .map(message => ({
        message,
        channel: sampleData.channels.find(c => c.id === message.channelId)!
      }));

    const fileResults = sampleData.messages
      .flatMap(message => 
        message.attachments.map(attachment => ({
          attachment,
          message,
          channel: sampleData.channels.find(c => c.id === message.channelId)!
        }))
      )
      .filter(({ attachment }) => 
        attachment.filename.toLowerCase().includes(query.toLowerCase())
      );

    setSearchResults({ messages: messageResults, files: fileResults });
  }

  const handleSelectSearchResult = (channelId: string, messageId: string) => {
    setSelectedChannelId(channelId)
    setSelectedUserId(null)
    setOpenThreadId(messageId)
    setSearchQuery('')
    setSearchResults({ messages: [], files: [] })
  }

  const handleSetUserStatus = (newStatus: string) => {
    setSampleData((prev) => {
      const updatedUsers = prev.users.map((u, idx) => {
        if (idx === 0) { // first user is "me"
          return { ...u, status: newStatus, updatedAt: new Date() }
        }
        return u
      })
      return { ...prev, users: updatedUsers }
    })
  }

  const handleSetUserAvatar = (newEmoji: string) => {
    setSampleData((prev) => {
      const updatedUsers = prev.users.map((u, idx) => {
        if (idx === 0) {
          return { ...u, avatar: newEmoji, updatedAt: new Date() }
        }
        return u
      })
      return { ...prev, users: updatedUsers }
    })
  }

  const handleSetUserName = (newName: string) => {
    setSampleData((prev) => {
      const updatedUsers = prev.users.map((u, idx) => {
        if (idx === 0) {
          return { ...u, name: newName, updatedAt: new Date() }
        }
        return u
      })
      return { ...prev, users: updatedUsers }
    })
  }

  const selectedChannel = sampleData.channels.find(c => c.id === selectedChannelId)
  const selectedUser = sampleData.users.find(u => u.id === selectedUserId)

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-slate-700">
      <div className="flex-none p-4 border-b border-gray-700 bg-gray-800 text-white">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={true}
          channels={sampleData.channels.filter(c => !c.isPrivate)}
          users={sampleData.users}
          onSelectChannel={handleSelectChannel}
          onSelectUser={handleSelectUser}
          onCreateChannel={handleCreateChannel}
          onSetUserStatus={handleSetUserStatus}
          onSetUserAvatar={handleSetUserAvatar}
          onSetUserName={handleSetUserName}
        />
        <div className="flex-1 flex flex-col">
          {searchQuery.trim().length > 0 ? (
            <SearchResults
              results={searchResults}
              users={sampleData.users}
              onSelectResult={handleSelectSearchResult}
            />
          ) : selectedChannel || selectedUser ? (
            <>
              <div className="p-4 border-b bg-white">
                <h2 className="text-xl font-semibold">
                  {selectedChannel ? (
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      {selectedChannel.name}
                    </div>
                  ) : selectedUser && (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="text-2xl">{selectedUser.avatar}</span>
                        <CircleStatus isOnline={selectedUser.isOnline} />
                      </div>
                      <div className="flex flex-col">
                        <span>{selectedUser.name}</span>
                        {selectedUser.status && (
                          <span className="text-sm text-gray-500">
                            {selectedUser.status}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </h2>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className={`flex-1 flex flex-col ${openThreadId ? 'md:w-2/3' : 'w-full'} bg-white border-l border-r`}>
                  <MessageList
                    messages={messages || []}
                    users={sampleData.users}
                    reactions={sampleData.reactions}
                    onReply={handleOpenThread}
                    onReact={handleReact}
                    onOpenThread={handleOpenThread}
                  />
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    replyingTo={null}
                    onCancelReply={() => {}}
                    placeholder="Send a message to the channel..."
                  />
                </div>
                {openThreadId && (
                  <div className="hidden md:flex md:w-1/3 border-l">
                    <ThreadView
                      parentMessage={messages.find((m) => m.id === openThreadId)!}
                      replies={messages.filter((m) => m.parentMessageId === openThreadId)}
                      users={sampleData.users}
                      reactions={sampleData.reactions}
                      onClose={handleCloseThread}
                      onReply={(content, parentMessageId) => handleSendReply(content, [], parentMessageId)}
                      onReact={handleReact}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Welcome to ChatGenius</h2>
                <p>Select a channel or user to start messaging, or use the search bar above.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

