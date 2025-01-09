'use client'

import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MessageList } from '@/components/MessageList'
import { ThreadView } from '@/components/ThreadView'
import { SearchBar } from '@/components/SearchBar'
import { Message, Channel, User, Reaction } from '@/types/dataStructures'

export default function Home() {
  const { userId } = useAuth()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [data, setData] = useState<{
    messages: Message[]
    channels: Channel[]
    users: User[]
    reactions: Reaction[]
  } | null>(null)

  useEffect(() => {
    if (!userId) {
      redirect('/sign-in')
      return
    }

    // Set user as online when they load the page
    fetch('/api/users/online', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: true })
    })

    // Set user as offline when they leave
    const handleBeforeUnload = () => {
      // Using sendBeacon for more reliable delivery during page unload
      navigator.sendBeacon('/api/users/online', JSON.stringify({ isOnline: false }))
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Set up polling for new data
    const pollInterval = setInterval(async () => {
      try {
        const dataRes = await fetch('/api/getData')
        if (dataRes.ok) {
          const newData = await dataRes.json()
          setData(prevData => {
            // Only update if there are actual changes
            if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
              return newData
            }
            return prevData
          })
        }
      } catch (error) {
        console.error('Error polling for new data:', error)
      }
    }, 3000) // Poll every 3 seconds

    const initializeUser = async () => {
      try {
        // Check if user exists
        const checkRes = await fetch('/api/users/profile/create');
        
        if (checkRes.status === 404) {
          // User doesn't exist, create new user
          const createRes = await fetch('/api/users/profile/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!createRes.ok) {
            throw new Error('Failed to create user profile');
          }
        } else if (!checkRes.ok) {
          throw new Error('Failed to check user profile');
        }

        // Fetch initial data
        const dataRes = await fetch('/api/getData');
        if (!dataRes.ok) {
          throw new Error('Failed to fetch initial data');
        }
        
        const initialData = await dataRes.json();
        setData(initialData);
      } catch (error) {
        console.error('Error in user initialization:', error);
      }
    };

    initializeUser();

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Set user as offline when component unmounts
      fetch('/api/users/online', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: false })
      })
    }
  }, [userId])

  if (!data || !userId) return null

  const handleSelectChannel = async (channelId: string, keepThread: boolean = false) => {
    // Try to join the channel first
    await fetch('/api/channels/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId })
    })
    
    setSelectedChannelId(channelId)
    if (!keepThread) {
      setSelectedThreadId(null)
    }
    
    // Refresh data to get updated channel memberships
    const newData = await fetch('/api/getData').then(res => res.json())
    setData(newData)
  }

  const handleOpenThread = (messageId: string) => {
    setSelectedThreadId(messageId)
  }

  const handleCloseThread = () => {
    setSelectedThreadId(null)
  }

  const handleReact = async (messageId: string, emoji: string) => {
    await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, emoji })
    })
    const newData = await fetch('/api/getData').then(res => res.json())
    setData(newData)
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    await fetch(`/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent })
    })
    const newData = await fetch('/api/getData').then(res => res.json())
    setData(newData)
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      console.log('Attempting to delete message:', messageId);
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      });

      console.log('Delete response status:', response.status);
      const text = await response.text();
      console.log('Delete response text:', text);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Failed to parse response:', e);
        return;
      }
      
      if (!response.ok) {
        console.error('Failed to delete message:', data.error || 'Unknown error');
        return;
      }

      const newData = await fetch('/api/getData').then(res => res.json());
      setData(newData);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  const handleSetUserStatus = async (newStatus: string) => {
    await fetch('/api/users/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    const newData = await fetch('/api/getData').then(res => res.json())
    setData(newData)
  }

  const handleSetUserAvatar = async (newEmoji: string) => {
    await fetch('/api/users/avatar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: newEmoji })
    })
    const newData = await fetch('/api/getData').then(res => res.json())
    setData(newData)
  }

  const handleSetUserName = async (newName: string) => {
    await fetch('/api/users/name', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    })
    const newData = await fetch('/api/getData').then(res => res.json())
    setData(newData)
  }

  const handleSendMessage = async (content: string, attachments: File[] = []) => {
    if (!selectedChannelId) return

    // Upload files first
    const uploadedAttachments = await Promise.all(
      attachments.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        return response.json()
      })
    )

    // Create message with uploaded file URLs
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content, 
        channelId: selectedChannelId,
        attachments: uploadedAttachments
      })
    })
    const newData = await fetch('/api/getData').then(res => res.json())
    setData(newData)
  }

  const handleCreateChannel = async (name: string, isPrivate: boolean) => {
    await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, isPrivate })
    })
    const newData = await fetch('/api/getData').then(res => res.json())
    setData(newData)
  }

  const handleSelectUser = async (targetUserId: string) => {
    try {
      console.log('Starting DM channel creation with:', { targetUserId, currentUserId: userId })
      
      // Create or get DM channel
      const userIds = targetUserId === userId ? [userId] : [userId, targetUserId]
      console.log('Using userIds:', userIds)
      
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDM: true,
          userIds
        })
      }).catch(e => {
        console.error('Fetch failed:', e)
        return null
      })

      if (!res) {
        console.error('Fetch returned null')
        return
      }

      console.log('Channel creation response:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries())
      })
      
      const responseText = await res.text().catch(e => {
        console.error('Failed to get response text:', e)
        return null
      })
      
      if (responseText === null) {
        console.error('Response text is null')
        return
      }

      console.log('Channel creation raw response:', responseText)

      if (!res.ok) {
        console.error('Response not ok:', {
          status: res.status,
          statusText: res.statusText,
          body: responseText
        })
        return
      }

      let channel
      try {
        channel = JSON.parse(responseText)
        console.log('Parsed channel:', channel)
      } catch (e) {
        console.error('Failed to parse response as JSON:', e)
        console.error('Raw response was:', responseText)
        return
      }

      // Join channel if not already a member
      console.log('Attempting to join channel:', channel.id)
      const joinRes = await fetch('/api/channels/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: channel.id,
          userId: userId
        })
      }).catch(e => {
        console.error('Join fetch failed:', e)
        return null
      })

      if (!joinRes) {
        console.error('Join fetch returned null')
        return
      }

      console.log('Join response:', {
        status: joinRes.status,
        statusText: joinRes.statusText,
        headers: Object.fromEntries(joinRes.headers.entries())
      })

      const joinResponseText = await joinRes.text().catch(e => {
        console.error('Failed to get join response text:', e)
        return null
      })

      if (joinResponseText === null) {
        console.error('Join response text is null')
        return
      }

      console.log('Join raw response:', joinResponseText)

      if (!joinRes.ok) {
        console.error('Join response not ok:', {
          status: joinRes.status,
          statusText: joinRes.statusText,
          body: joinResponseText
        })
        return
      }

      // Update selected channel
      console.log('Setting selected channel:', channel.id)
      setSelectedChannelId(channel.id)
      setSelectedThreadId(null)
      
      // Refresh data
      console.log('Refreshing data')
      const dataRes = await fetch('/api/getData').catch(e => {
        console.error('Data fetch failed:', e)
        return null
      })

      if (!dataRes) {
        console.error('Data fetch returned null')
        return
      }

      console.log('Data refresh response:', {
        status: dataRes.status,
        statusText: dataRes.statusText
      })
      
      if (!dataRes.ok) {
        const errorText = await dataRes.text().catch(e => {
          console.error('Failed to get error text:', e)
          return 'Failed to get error details'
        })
        console.error('Error refreshing data:', errorText)
        return
      }
      
      const newData = await dataRes.json().catch(e => {
        console.error('Failed to parse data response:', e)
        return null
      })

      if (!newData) {
        console.error('Failed to get new data')
        return
      }

      console.log('Got new data, updating state')
      setData(newData)
    } catch (error) {
      console.error('Error in handleSelectUser:', error)
      // Log the full error details
      if (error instanceof Error) {
        console.error({
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause
        })
      } else {
        console.error('Non-Error object thrown:', error)
      }
    }
  }

  const selectedChannel = data.channels.find(c => c.id === selectedChannelId)
  const channelMessages = selectedChannel 
    ? data.messages.filter(m => m.channelId === selectedChannel.id)
    : []

  const selectedThread = selectedThreadId 
    ? data.messages.find(m => m.id === selectedThreadId)
    : null
  const threadReplies = selectedThread
    ? data.messages.filter(m => m.parentMessageId === selectedThread.id)
    : []

  return (
    <div className="h-screen flex flex-col">
      <SearchBar 
        onSelectChannel={handleSelectChannel} 
        onOpenThread={handleOpenThread}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={true}
          channels={data.channels}
          users={data.users}
          currentUserId={userId}
          onSelectChannel={handleSelectChannel}
          onCreateChannel={handleCreateChannel}
          onSetUserStatus={handleSetUserStatus}
          onSetUserAvatar={handleSetUserAvatar}
          onSetUserName={handleSetUserName}
        />
        <main className="flex-1 flex">
          {selectedChannelId && (
            <MessageList
              channelId={selectedChannelId}
              messages={data.messages.filter(m => m.channelId === selectedChannelId)}
              users={data.users}
              reactions={data.reactions}
              currentUserId={userId}
              onOpenThread={handleOpenThread}
              onReact={handleReact}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onSendMessage={handleSendMessage}
              onReply={handleOpenThread}
              channelName={data.channels.find(c => c.id === selectedChannelId)?.name}
              isDM={data.channels.find(c => c.id === selectedChannelId)?.isDM}
            />
          )}
          {selectedThreadId && (() => {
            const parentMessage = data.messages.find(m => m.id === selectedThreadId)
            if (!parentMessage) return null
            
            return (
              <ThreadView
                parentMessage={parentMessage}
                replies={data.messages.filter(m => m.parentMessageId === selectedThreadId)}
                users={data.users}
                reactions={data.reactions}
                currentUserId={userId}
                onClose={handleCloseThread}
                onReact={handleReact}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onReply={async (content, attachments, parentId) => {
                  // Upload files first
                  const uploadedAttachments = await Promise.all(
                    attachments.map(async (file) => {
                      const formData = new FormData()
                      formData.append('file', file)
                      const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                      })
                      return response.json()
                    })
                  )

                  // Create message with uploaded file URLs
                  await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      content, 
                      channelId: selectedChannelId!,
                      parentMessageId: parentId,
                      attachments: uploadedAttachments
                    })
                  })
                  const newData = await fetch('/api/getData').then(res => res.json())
                  setData(newData)
                }}
              />
            )
          })()}
        </main>
      </div>
    </div>
  )
}

