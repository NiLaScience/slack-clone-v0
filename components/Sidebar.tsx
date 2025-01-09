import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Hash, Menu, LogOut } from 'lucide-react'
import { Channel, User as UserType } from "@/types/dataStructures"
import { CreateChannelDialog } from "./CreateChannelDialog"
import { UserProfileStatus } from "./UserProfileStatus"
import { CircleStatus } from "@/components/ui/circle-status"
import { SignOutButton } from "@clerk/nextjs"
import { getChannelDisplayName } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean;
  channels: Channel[];
  users: UserType[];
  currentUserId: string;
  onSelectChannel: (channelId: string) => void;
  onCreateChannel: (name: string, isPrivate: boolean) => void;
  onSetUserStatus: (newStatus: string) => void;
  onSetUserAvatar: (newEmoji: string) => void;
  onSetUserName: (newName: string) => void;
}

export function Sidebar({ 
  isOpen, 
  channels, 
  users, 
  currentUserId,
  onSelectChannel, 
  onCreateChannel, 
  onSetUserStatus, 
  onSetUserAvatar,
  onSetUserName 
}: SidebarProps) {
  const currentUser = users.find(user => user.id === currentUserId)
  if (!currentUser) return null

  // Separate channels into regular and DM channels
  const regularChannels = channels.filter(channel => !channel.isDM)
  const dmChannels = channels.filter(channel => channel.isDM)

  const SidebarContent = () => (
    <ScrollArea className="h-full py-6 pl-4 pr-6 flex flex-col bg-gray-800 text-white">
      <h2 className="mb-4 text-lg font-semibold">Channels</h2>
      <div className="space-y-2">
        {regularChannels.map((channel) => (
          <Button
            key={channel.id}
            variant="ghost"
            className="w-full justify-start hover:bg-gray-700"
            onClick={() => onSelectChannel(channel.id)}
          >
            <Hash className="mr-2 h-4 w-4" />
            {channel.name}
          </Button>
        ))}
      </div>
      <CreateChannelDialog onCreateChannel={onCreateChannel} />
      <h2 className="mt-6 mb-4 text-lg font-semibold">Direct Messages</h2>
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
              className="w-full justify-start items-center hover:bg-gray-700"
              onClick={() => onSelectChannel(channel.id)}
            >
              <div className="flex items-center relative">
                <div className="relative w-6 h-6 mr-2 flex items-center justify-center">
                  <span className="text-xl">{otherUser?.avatar || '👤'}</span>
                  <CircleStatus isOnline={otherUser?.isOnline} />
                </div>
                <span>
                  {displayName}
                  {otherUser?.status ? ` - ${otherUser.status}` : ""}
                </span>
              </div>
            </Button>
          )
        })}
      </div>
      <div className="mt-auto space-y-4 border-t pt-4">
        <UserProfileStatus
          user={currentUser}
          onSetUserStatus={onSetUserStatus}
          onSetUserAvatar={onSetUserAvatar}
          onSetUserName={onSetUserName}
        />
        <SignOutButton>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-700">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </SignOutButton>
      </div>
    </ScrollArea>
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

