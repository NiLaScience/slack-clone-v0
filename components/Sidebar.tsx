import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Hash, User, Users, Menu } from 'lucide-react'
import { Channel, User as UserType } from "@/types/dataStructures"
import { CreateChannelDialog } from "./CreateChannelDialog"
import { UserProfileStatus } from "./UserProfileStatus"
import { CircleStatus } from "@/components/ui/circle-status"

interface SidebarProps {
  isOpen: boolean;
  channels: Channel[];
  users: UserType[];
  onSelectChannel: (channelId: string) => void;
  onSelectUser: (userId: string) => void;
  onCreateChannel: (name: string, isPrivate: boolean) => void;
  onSetUserStatus: (newStatus: string) => void;
  onSetUserAvatar: (newEmoji: string) => void;
  onSetUserName: (newName: string) => void;
}

export function Sidebar({ isOpen, channels, users, onSelectChannel, onSelectUser, onCreateChannel, onSetUserStatus, onSetUserAvatar, onSetUserName }: SidebarProps) {
  const SidebarContent = () => (
    <ScrollArea className="h-full py-6 pl-4 pr-6 flex flex-col">
      <h2 className="mb-4 text-lg font-semibold">Channels</h2>
      <div className="space-y-2">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant="ghost"
            className="w-full justify-start"
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
        {users.map((user) => (
          <Button
            key={user.id}
            variant="ghost"
            className="w-full justify-start items-center"
            onClick={() => onSelectUser(user.id)}
          >
            <div className="flex items-center relative">
              <div className="relative w-6 h-6 mr-2 flex items-center justify-center">
                <span className="text-xl">{user.avatar}</span>
                <CircleStatus isOnline={user.isOnline} />
              </div>
              <span>
                {user.name}
                {user.status ? ` - ${user.status}` : ""}
              </span>
            </div>
          </Button>
        ))}
      </div>
      <div className="mt-auto p-2 border-t">
        <UserProfileStatus
          user={users[0]}
          onSetUserStatus={onSetUserStatus}
          onSetUserAvatar={onSetUserAvatar}
          onSetUserName={onSetUserName}
        />
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
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

