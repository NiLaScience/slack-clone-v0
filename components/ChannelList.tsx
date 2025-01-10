import { Channel, ChannelMembership } from "@/types/dataStructures"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Hash, Users, Plus, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateChannelDialog } from "./CreateChannelDialog"
import { useState } from "react"
import { getChannelDisplayName } from "@/lib/utils"
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

interface ChannelListProps {
  channels: Channel[];
  memberships: ChannelMembership[];
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  onCreateChannel: (name: string, isPrivate: boolean) => void;
  onDeleteChannel: (channelId: string) => void;
  currentUserId: string;
  users: { id: string; name: string }[];
}

export function ChannelList({ 
  channels, 
  memberships, 
  selectedChannelId, 
  onSelectChannel,
  onCreateChannel,
  onDeleteChannel,
  currentUserId,
  users
}: ChannelListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateChannel = (name: string, isPrivate: boolean) => {
    onCreateChannel(name, isPrivate);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold tracking-tight">Channels</h2>
      </div>
      <ScrollArea className="h-[300px] px-1">
        <div className="space-y-1">
          {channels.map((channel) => {
            // Only show channels the user is a member of
            const isMember = memberships.some(m => m.channelId === channel.id);
            if (!isMember) return null;

            const displayName = getChannelDisplayName({ 
              name: channel.name, 
              isDM: channel.isDM,
              memberIds: memberships
                .filter(m => m.channelId === channel.id)
                .map(m => m.userId)
            }, currentUserId, users);

            return (
              <div 
                key={channel.id}
                className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer ${
                  selectedChannelId === channel.id 
                    ? 'bg-accent' 
                    : 'hover:bg-accent/50'
                }`}
              >
                <div 
                  className="flex items-center flex-1"
                  onClick={() => onSelectChannel(channel.id)}
                >
                  {channel.isDM ? (
                    <Users className="h-4 w-4 mr-2" />
                  ) : (
                    <Hash className="h-4 w-4 mr-2" />
                  )}
                  <span className="truncate">{displayName}</span>
                </div>
                {!channel.isDM && selectedChannelId === channel.id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Channel</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete #{displayName}? This action cannot be undone.
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
            );
          })}
        </div>
      </ScrollArea>
      <div className="px-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Channel
        </Button>
      </div>
      <CreateChannelDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateChannel}
      />
    </div>
  );
} 