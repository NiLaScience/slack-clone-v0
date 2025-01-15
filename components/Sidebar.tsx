import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Hash, Menu, LogOut, Plus, Trash2 } from 'lucide-react'
import { Channel, User as UserType } from "@/types/dataStructures"
import { CreateChannelDialog } from "./CreateChannelDialog"
import { UserMenu } from "./UserMenu"
import { CircleStatus } from "@/components/ui/circle-status"
import { SignOutButton, useClerk } from "@clerk/nextjs"
import { getChannelDisplayName } from "@/lib/utils"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  channels: Channel[];
  users: UserType[];
  currentUserId: string;
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  onCreateChannel: (name: string, isPrivate: boolean) => void;
  onDeleteChannel: (channelId: string) => void;
  onSetUserStatus: (newStatus: string) => void;
  onSetUserAvatar: (newEmoji: string) => void;
  onSetUserName: (newName: string) => void;
}

const PROTECTED_CHANNELS = ['general', 'random']
const CHANNEL_ORDER = ['general', 'random'] // Defines the exact order for protected channels

export function Sidebar({ 
  isOpen, 
  channels, 
  users, 
  currentUserId,
  selectedChannelId,
  onSelectChannel, 
  onCreateChannel,
  onDeleteChannel,
  onSetUserStatus, 
  onSetUserAvatar,
  onSetUserName 
}: SidebarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const currentUser = users.find(user => user.id === currentUserId)
  const { signOut } = useClerk();
  const router = useRouter();
  if (!currentUser) return null

  // Separate and sort channels
  const regularChannels = channels
    .filter(channel => !channel.isDM)
    .sort((a, b) => {
      // If both are protected channels, sort by predefined order
      const aIndex = CHANNEL_ORDER.indexOf(a.name)
      const bIndex = CHANNEL_ORDER.indexOf(b.name)
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }
      // If only one is protected, it goes first
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      // Otherwise, sort alphabetically
      return a.name.localeCompare(b.name)
    })

  const dmChannels = channels
    .filter(channel => {
      // Only show DM channels where the current user is a member
      return channel.isDM && (channel.memberIds || []).includes(currentUserId);
    })
    .sort((a, b) => {
      // Notes to self goes first
      if (a.isSelfNote) return -1
      if (b.isSelfNote) return 1
      // Otherwise sort by name
      return a.name.localeCompare(b.name)
    })

  const handleCreateChannel = (name: string, isPrivate: boolean) => {
    onCreateChannel(name, isPrivate);
    setIsCreateDialogOpen(false);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-gray-800">
      <ScrollArea className="flex-1 py-6 pl-4 pr-6">
        <div className="space-y-6">
          {/* Channels Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Channels</h2>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-gray-700 text-gray-400 hover:text-white"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {regularChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between group"
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start hover:bg-gray-700 text-gray-300 hover:text-white ${
                      selectedChannelId === channel.id ? 'bg-gray-700 text-white' : ''
                    }`}
                    onClick={() => onSelectChannel(channel.id)}
                  >
                    <Hash className="mr-2 h-4 w-4 shrink-0" />
                    {channel.name}
                  </Button>
                  {selectedChannelId === channel.id && !PROTECTED_CHANNELS.includes(channel.name) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 hover:bg-gray-700 text-gray-400 hover:text-white">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Channel</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete #{channel.name}? This action cannot be undone.
                            All messages and files in this channel will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteChannel(channel.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Channel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DMs Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-white">Direct Messages</h2>
            <div className="space-y-2">
              {dmChannels.map((channel) => {
                const displayName = getChannelDisplayName({ 
                  name: channel.name, 
                  isDM: channel.isDM, 
                  memberIds: channel.memberIds || []
                }, currentUserId, users)
                const otherUserId = (channel.memberIds || []).find(id => id !== currentUserId)
                const otherUser = users.find(user => user.id === otherUserId)
                
                return (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    className={`w-full justify-start items-center hover:bg-gray-700 text-gray-300 hover:text-white ${
                      selectedChannelId === channel.id ? 'bg-gray-700 text-white' : ''
                    }`}
                    onClick={() => onSelectChannel(channel.id)}
                  >
                    <div className="flex items-center relative">
                      <div className="relative w-6 h-6 mr-2 flex items-center justify-center">
                        {channel.isSelfNote ? (
                          <>
                            <span className="text-xl">{currentUser.avatar || '👤'}</span>
                            <CircleStatus isOnline={currentUser.isOnline} status={currentUser.status} />
                          </>
                        ) : (
                          <>
                            <span className="text-xl">{otherUser?.avatar || '👤'}</span>
                            <CircleStatus isOnline={otherUser?.isOnline} status={otherUser?.status} />
                          </>
                        )}
                      </div>
                      <span>
                        {displayName}
                        {!channel.isSelfNote && otherUser?.status ? (
                          <span className="text-gray-400 ml-2">{otherUser.status}</span>
                        ) : null}
                      </span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Section - Always visible */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700 mt-auto">
        <div className="space-y-4 text-white">
          <UserMenu
            user={currentUser}
            onSetStatus={onSetUserStatus}
            onSetAvatar={onSetUserAvatar}
            onSetName={onSetUserName}
          />
          <button
            onClick={async () => {
              await signOut();
              router.push("/sign-in");
            }}
            className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-700 text-gray-300 hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </div>

      <CreateChannelDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateChannel}
      />
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block w-64 bg-background border-r transition-all duration-300 ${isOpen ? '' : '-ml-64'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

