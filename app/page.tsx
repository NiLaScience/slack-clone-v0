'use client'

import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MessageList } from '@/components/MessageList'
import { ThreadView } from '@/components/ThreadView'
import { SearchBar } from '@/components/SearchBar'
import { Message, Channel, User, Reaction } from '@/types/dataStructures'
import Pusher from 'pusher-js'

type AppData = {
  messages: Message[]
  channels: Channel[]
  users: User[]
  reactions: Reaction[]
}

export default function Home() {
  const { userId } = useAuth()
  const [data, setData] = useState<AppData | null>(null)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const pusherRef = useRef<Pusher | null>(null)
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes
  const POLLING_INTERVAL = 10000 // 10 seconds as fallback

  // Function to update online status
  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      await fetch('/api/users/online', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline })
      })
    } catch (error) {
      console.error('Failed to update online status:', error)
    }
  }

  const normalizeDataForComparison = (data: any) => {
    return {
      messages: data.messages.map((m: any) => ({
        id: m.id,
        channelId: m.channelId,
        senderId: m.senderId,
        content: m.content,
        parentMessageId: m.parentMessageId,
        isDeleted: m.isDeleted,
        // Exclude timestamps
      })),
      channels: data.channels.map((c: any) => ({
        id: c.id,
        name: c.name,
        isPrivate: c.isPrivate,
        isDM: c.isDM,
        isSelfNote: c.isSelfNote,
        // Exclude timestamps
      })),
      users: data.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        status: u.status,
        isOnline: u.isOnline,
        // Exclude timestamps
      })),
      reactions: data.reactions.map((r: any) => ({
        id: r.id,
        messageId: r.messageId,
        userId: r.userId,
        emoji: r.emoji,
        // Exclude timestamps
      }))
    }
  }

  // Initialize user only once
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if user exists
        const checkRes = await fetch('/api/users/profile/create')
        
        if (checkRes.status === 404) {
          // User doesn't exist, create new user
          const createRes = await fetch('/api/users/profile/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
          
          if (!createRes.ok) {
            throw new Error('Failed to create user profile')
          }
        } else if (!checkRes.ok) {
          throw new Error('Failed to check user profile')
        }

        // Fetch initial data
        const dataRes = await fetch('/api/getData')
        if (!dataRes.ok) {
          throw new Error('Failed to fetch initial data')
        }
        
        const initialData = await dataRes.json()
        setData(initialData)
      } catch (error) {
        console.error('Error in user initialization:', error)
      }
    }

    if (userId) {
      initializeUser()
    }
  }, [userId]) // Only run when userId changes

  // Pusher setup
  useEffect(() => {
    if (!userId) return;

    // Initialize Pusher
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      enabledTransports: ['ws', 'wss']
    });

    const pusher = pusherRef.current;

    // Subscribe to global updates
    const globalChannel = pusher.subscribe('global');
    
    // Debug logging
    globalChannel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to global channel');
    });

    globalChannel.bind('pusher:subscription_error', (error: any) => {
      console.error('Failed to subscribe to global channel:', error);
    });

    // User events
    globalChannel.bind('user-status-changed', (data: { userId: string, isOnline: boolean }) => {
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          users: prevData.users.map(u => 
            u.id === data.userId ? { ...u, isOnline: data.isOnline } : u
          )
        };
      });
    });

    globalChannel.bind('user-updated', (data: { userId: string, avatar?: string, name?: string, status?: string }) => {
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          users: prevData.users.map(u => 
            u.id === data.userId ? { ...u, ...data } : u
          )
        };
      });
    });

    // Channel events
    globalChannel.bind('channel-created', (data: Channel) => {
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          channels: [...prevData.channels, data]
        };
      });
    });

    globalChannel.bind('channel-deleted', (data: { id: string }) => {
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          channels: prevData.channels.filter(c => c.id !== data.id)
        };
      });
    });

    // Connection status
    pusher.connection.bind('connected', () => {
      console.log('Pusher connected');
      setIsSocketConnected(true);
    });

    pusher.connection.bind('error', (error: any) => {
      console.error('Pusher connection error:', error);
      setIsSocketConnected(false);
    });

    pusher.connection.bind('disconnected', () => {
      console.log('Pusher disconnected');
      setIsSocketConnected(false);
    });

    return () => {
      globalChannel.unbind_all();
      pusher.unsubscribe('global');
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [userId]);

  // Channel subscription
  useEffect(() => {
    const pusher = pusherRef.current;
    if (!pusher || !selectedChannelId) return;

    // Subscribe to channel-specific updates
    const channel = pusher.subscribe(`channel-${selectedChannelId}`);
    
    // Message events
    channel.bind('message-created', (data: Message) => {
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          messages: [...prevData.messages, data]
        };
      });
    });

    channel.bind('message-updated', (data: Message) => {
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          messages: prevData.messages.map(m => 
            m.id === data.id ? data : m
          )
        };
      });
    });

    channel.bind('message-deleted', (data: { id: string }) => {
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          messages: prevData.messages.filter(m => m.id !== data.id)
        };
      });
    });

    // Reaction events
    channel.bind('reaction-toggled', (data: { 
      messageId: string, 
      action: 'added' | 'removed',
      reaction?: Reaction,
      reactionId?: string 
    }) => {
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          messages: prevData.messages.map(msg => {
            if (msg.id === data.messageId) {
              if (data.action === 'added' && data.reaction) {
                return {
                  ...msg,
                  reactions: [...(msg.reactions || []), data.reaction]
                };
              } else if (data.action === 'removed' && data.reactionId) {
                return {
                  ...msg,
                  reactions: (msg.reactions || []).filter(r => r.id !== data.reactionId)
                };
              }
            }
            return msg;
          })
        };
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`channel-${selectedChannelId}`);
    };
  }, [selectedChannelId]);

  // Handle polling and activity tracking
  useEffect(() => {
    // Set up activity tracking
    const handleActivity = () => {
      clearTimeout(inactivityTimeoutRef.current)
      if (!isActive) {
        setIsActive(true)
        updateOnlineStatus(true)
      }
      inactivityTimeoutRef.current = setTimeout(() => {
        setIsActive(false)
        updateOnlineStatus(false)
      }, INACTIVITY_TIMEOUT)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false)
        updateOnlineStatus(false)
      } else {
        setIsActive(true)
        updateOnlineStatus(true)
      }
    }

    const handleBeforeUnload = () => {
      updateOnlineStatus(false)
    }

    // Set up event listeners
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    // Start polling (reduced frequency, as fallback)
    const pollInterval = setInterval(async () => {
      if (!isSocketConnected) { // Only poll when socket is disconnected
        try {
          // Send heartbeat first
          await fetch('/api/users/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })

          const dataRes = await fetch('/api/getData')
          if (dataRes.ok) {
            const newData = await dataRes.json()
            setData(prevData => {
              if (!prevData) return newData
              return normalizeDataForComparison(prevData) !== normalizeDataForComparison(newData) 
                ? newData 
                : prevData
            })
          }
        } catch (error) {
          console.error('Error polling for new data:', error)
        }
      }
    }, POLLING_INTERVAL)

    return () => {
      // Clean up all event listeners
      clearTimeout(inactivityTimeoutRef.current)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
      clearInterval(pollInterval)

      // Set user as offline when component unmounts
      updateOnlineStatus(false)
    }
  }, [userId, isActive, INACTIVITY_TIMEOUT, isSocketConnected]) // Include INACTIVITY_TIMEOUT in deps

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

  const handleSendMessage = async (content: string, attachments: File[] = [], askBot: boolean = false) => {
    if (!selectedChannelId) return

    try {
      // Upload files first
      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
          }
          const data = await response.json()
          return {
            filename: data.filename,
            fileUrl: data.fileUrl,
            contentType: data.contentType
          }
        })
      )

      // Create message with uploaded file URLs
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          channelId: selectedChannelId,
          attachments: uploadedAttachments,
          askBot
        })
      })

      if (!response.ok) {
        throw new Error(`Message creation failed: ${response.statusText}`)
      }

      const newData = await fetch('/api/getData').then(res => res.json())
      setData(newData)
    } catch (error) {
      console.error('Error sending message:', error)
      // You might want to add error handling UI here
    }
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
      
      // Check if this is a self-note request
      const isSelfNote = targetUserId === userId
      
      // If it's a self-note, first try to find an existing one
      if (isSelfNote) {
        const existingChannel = data.channels.find(
          ch => ch.isSelfNote && ch.memberships?.some(m => m.userId === userId)
        )
        if (existingChannel) {
          setSelectedChannelId(existingChannel.id)
          return
        }
      }
      
      // Create or get DM channel
      const userIds = isSelfNote ? [userId] : [userId, targetUserId].sort()
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

  const handleDeleteChannel = async (channelId: string) => {
    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete channel');
      }

      // Refresh data
      const newData = await fetch('/api/getData').then(res => res.json());
      setData(newData);
      
      // Clear selected channel if it was deleted
      if (selectedChannelId === channelId) {
        setSelectedChannelId(null);
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
      // You might want to show an error toast here
    }
  };

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
          selectedChannelId={selectedChannelId}
          onSelectChannel={handleSelectChannel}
          onCreateChannel={handleCreateChannel}
          onDeleteChannel={handleDeleteChannel}
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
              channelName={selectedChannel?.name}
              isDM={selectedChannel?.isDM}
              isSelfNote={selectedChannel?.isSelfNote}
              memberships={selectedChannel?.memberships}
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
                  try {
                    // Upload files first
                    const uploadedAttachments = await Promise.all(
                      attachments.map(async (file) => {
                        const formData = new FormData()
                        formData.append('file', file)
                        const response = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData
                        })
                        if (!response.ok) {
                          throw new Error(`Upload failed: ${response.statusText}`)
                        }
                        const data = await response.json()
                        return {
                          filename: data.filename,
                          fileUrl: data.fileUrl,
                          contentType: data.contentType
                        }
                      })
                    )

                    // Create message with uploaded file URLs
                    const response = await fetch('/api/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        content, 
                        channelId: selectedChannelId!,
                        parentMessageId: parentId,
                        attachments: uploadedAttachments
                      })
                    })

                    if (!response.ok) {
                      throw new Error(`Message creation failed: ${response.statusText}`)
                    }

                    const newData = await fetch('/api/getData').then(res => res.json())
                    setData(newData)
                  } catch (error) {
                    console.error('Error sending reply:', error)
                    // You might want to add error handling UI here
                  }
                }}
              />
            )
          })()}
        </main>
      </div>
    </div>
  )
}

