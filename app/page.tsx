'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MessageList } from '@/components/MessageList'
import { MessageInput } from '@/components/MessageInput'
import { ThreadView } from '@/components/ThreadView'
import { SearchBar } from '@/components/SearchBar'
import { SearchResults } from '@/components/SearchResults'
import { User, Channel, ChannelMembership, Message, Reaction, Attachment } from '@/types/dataStructures'
import { CircleStatus } from '@/components/ui/circle-status'
import { Hash } from 'lucide-react'

export default function Page() {
  const [appData, setAppData] = useState<{
    users: User[]
    channels: Channel[]
    channelMemberships: ChannelMembership[]
    messages: Message[]
    reactions: Reaction[]
  } | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [openThreadId, setOpenThreadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    messages: { message: Message; channel: Channel }[];
    files: { attachment: Attachment; message: Message; channel: Channel }[];
  }>({ messages: [], files: [] })

  // Fetch initial data
  useEffect(() => {
    fetch('/api/getData')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Failed to fetch data: ${res.status} ${text}`)
        }
        return res.json()
      })
      .then(data => {
        setAppData(data)
      })
      .catch(err => {
        console.error('Failed to fetch data:', err)
      })
  }, [])

  // Keep selected channel/user in sync
  useEffect(() => {
    if (!appData) return
    const newSelectedChannel = appData.channels.find(c => c.id === selectedChannelId) || null
    const newSelectedUser = appData.users.find(u => u.id === selectedUserId) || null
    setSelectedChannel(newSelectedChannel)
    setSelectedUser(newSelectedUser)
  }, [selectedChannelId, selectedUserId, appData])

  // Update messages when selection changes
  useEffect(() => {
    if (!appData) return
    if (selectedChannelId) {
      setMessages(appData.messages.filter(m => m.channelId === selectedChannelId))
    } else if (selectedUserId) {
      const dmChannel = appData.channels.find(c => 
        c.isPrivate && c.name.includes(appData.users.find(u => u.id === selectedUserId)?.name || '')
      )
      setMessages(dmChannel ? appData.messages.filter(m => m.channelId === dmChannel.id) : [])
    } else {
      setMessages([])
    }
  }, [selectedChannelId, selectedUserId, appData])

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

  const handleCreateChannel = async (channelName: string) => {
    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: channelName }),
      })
      
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to create channel: ${response.status} ${text}`)
      }
      
      await response.json()
      
      // Refresh data
      const dataResponse = await fetch('/api/getData')
      if (!dataResponse.ok) {
        const text = await dataResponse.text()
        throw new Error(`Failed to refresh data: ${dataResponse.status} ${text}`)
      }
      const data = await dataResponse.json()
      setAppData(data)
    } catch (error) {
      console.error('Error creating channel:', error)
    }
  }

  const handleSendMessage = async (content: string, attachments: File[]) => {
    if (!appData) return
    try {
      const newChannelId = selectedChannelId || 
        appData.channels.find(c =>
          c.isPrivate && c.name.includes(appData.users.find(u => u.id === selectedUserId)?.name || '')
        )?.id || ''

      if (!newChannelId) {
        throw new Error('No channel selected and no DM channel found')
      }

      console.log('Sending message:', {
        content,
        channelId: newChannelId,
        attachmentsCount: attachments.length
      })

      // Upload files first (in a real app, this would go to S3/etc)
      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => ({
          filename: file.name,
          fileUrl: URL.createObjectURL(file),
          contentType: file.type,
        }))
      )

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          channelId: newChannelId,
          attachments: uploadedAttachments,
        }),
      })

      const responseData = await response.json().catch(() => null)
      console.log('Message API response:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      })

      if (!response.ok) {
        throw new Error(
          `Failed to send message: ${response.status} ${
            responseData?.details || responseData?.error || 'Unknown error'
          }`
        )
      }

      // Refresh data
      console.log('Refreshing data after message send')
      const dataResponse = await fetch('/api/getData')
      if (!dataResponse.ok) {
        const text = await dataResponse.text()
        throw new Error(`Failed to refresh data: ${dataResponse.status} ${text}`)
      }
      const newData = await dataResponse.json()
      setAppData(newData)
      setMessages(newData.messages.filter((m: Message) => m.channelId === newChannelId))
    } catch (error) {
      console.error('Failed to send message:', error)
      // TODO: Show error to user via toast or alert
      alert(error instanceof Error ? error.message : 'Failed to send message')
    }
  }

  const handleSendReply = async (content: string, attachments: File[], parentMessageId: string) => {
    if (!appData) return
    const parentMsg = appData.messages.find(m => m.id === parentMessageId)
    if (!parentMsg) {
      console.error('Parent message not found:', parentMessageId)
      return
    }

    try {
      console.log('Sending reply:', {
        content,
        channelId: parentMsg.channelId,
        parentMessageId,
        attachmentsCount: attachments.length
      })

      // Handle attachments similarly
      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => ({
          filename: file.name,
          fileUrl: URL.createObjectURL(file),
          contentType: file.type,
        }))
      )

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          channelId: parentMsg.channelId,
          parentMessageId,
          attachments: uploadedAttachments,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          `Failed to send reply: ${response.status} ${
            errorData?.details || errorData?.error || 'Unknown error'
          }`
        )
      }

      // Refresh data
      console.log('Refreshing data after reply')
      const dataResponse = await fetch('/api/getData')
      if (!dataResponse.ok) {
        const text = await dataResponse.text()
        throw new Error(`Failed to refresh data: ${dataResponse.status} ${text}`)
      }
      const newData = await dataResponse.json()
      setAppData(newData)
      setMessages(newData.messages.filter((m: Message) => m.channelId === parentMsg.channelId))
    } catch (error) {
      console.error('Failed to send reply:', error)
      alert(error instanceof Error ? error.message : 'Failed to send reply')
    }
  }

  const handleReact = async (messageId: string, emoji: string) => {
    if (!appData) return
    
    const existingReaction = appData.reactions.find(
      r => r.messageId === messageId && r.userId === appData.users[0].id && r.emoji === emoji
    )
    
    if (existingReaction) {
      // Delete reaction
      await fetch('/api/reactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existingReaction.id }),
      })
    } else {
      // Create reaction
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji }),
      })
    }
    
    // Refresh data instead of updating local state
    const newData = await fetch('/api/getData').then(res => res.json())
    setAppData(newData)
  }

  const handleOpenThread = async (messageId: string) => {
    // First verify the message exists in DB
    try {
      const response = await fetch(`/api/messages/${messageId}`)
      if (!response.ok) {
        console.error('Failed to fetch message:', messageId)
        return
      }
      
      // Refresh data to ensure we have latest state
      const dataResponse = await fetch('/api/getData')
      if (!dataResponse.ok) {
        throw new Error(`Failed to refresh data: ${dataResponse.status}`)
      }
      const newData = await dataResponse.json()
      setAppData(newData)
      
      // Only open thread if message exists in fresh data
      const message = newData.messages.find((m: Message) => m.id === messageId)
      if (message) {
        setOpenThreadId(messageId)
        setSelectedChannelId(message.channelId)
      }
    } catch (error) {
      console.error('Failed to open thread:', error)
    }
  }

  const handleCloseThread = () => {
    setOpenThreadId(null)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!appData) return
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Search failed: ${response.status} ${text}`)
      }
      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults({ messages: [], files: [] })
    }
  }

  const handleSelectSearchResult = (channelId: string, messageId: string) => {
    setSelectedChannelId(channelId)
    setSelectedUserId(null)
    setOpenThreadId(messageId)
    setSearchQuery('')
    setSearchResults({ messages: [], files: [] })
  }

  const handleSetUserStatus = async (newStatus: string) => {
    try {
      const response = await fetch('/api/users/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to update status: ${response.status} ${text}`)
      }
      
      await response.json()
      
      // Refresh data
      const dataResponse = await fetch('/api/getData')
      if (!dataResponse.ok) {
        const text = await dataResponse.text()
        throw new Error(`Failed to refresh data: ${dataResponse.status} ${text}`)
      }
      const newData = await dataResponse.json()
      setAppData(newData)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleSetUserAvatar = async (newEmoji: string) => {
    try {
      const response = await fetch('/api/users/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: newEmoji }),
      })
      
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to update avatar: ${response.status} ${text}`)
      }
      
      await response.json()
      
      // Refresh data
      const dataResponse = await fetch('/api/getData')
      if (!dataResponse.ok) {
        const text = await dataResponse.text()
        throw new Error(`Failed to refresh data: ${dataResponse.status} ${text}`)
      }
      const newData = await dataResponse.json()
      setAppData(newData)
    } catch (error) {
      console.error('Failed to update avatar:', error)
    }
  }

  const handleSetUserName = async (newName: string) => {
    try {
      const response = await fetch('/api/users/name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to update name: ${response.status} ${text}`)
      }
      
      await response.json()
      
      // Refresh data
      const dataResponse = await fetch('/api/getData')
      if (!dataResponse.ok) {
        const text = await dataResponse.text()
        throw new Error(`Failed to refresh data: ${dataResponse.status} ${text}`)
      }
      const newData = await dataResponse.json()
      setAppData(newData)
    } catch (error) {
      console.error('Failed to update name:', error)
    }
  }

  return (
    !appData ? (
      <div>Loading data...</div>
    ) : (
      <div className="flex flex-col h-screen bg-gray-50 text-slate-700">
        <div className="flex-none p-4 border-b border-gray-700 bg-gray-800 text-white">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            isOpen={true}
            channels={appData.channels.filter(ch => !ch.isPrivate)}
            users={appData.users}
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
                users={appData.users}
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
                      users={appData.users}
                      reactions={appData.reactions}
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
                      {messages.some(m => m.id === openThreadId) ? (
                        <ThreadView
                          parentMessage={messages.find((m) => m.id === openThreadId)!}
                          replies={messages.filter((m) => m.parentMessageId === openThreadId)}
                          users={appData.users}
                          reactions={appData.reactions}
                          onClose={handleCloseThread}
                          onReply={(content, parentMessageId) => handleSendReply(content, [], parentMessageId)}
                          onReact={handleReact}
                        />
                      ) : (
                        <div className="p-4">Loading thread...</div>
                      )}
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
  )
}

