import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types/dataStructures";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    status: string | null;
    prompt: string | null;
    isOnline: boolean;
  };
  onSetStatus: (newStatus: string) => void;
  onSetAvatar: (newEmoji: string) => void;
  onSetName: (newName: string) => void;
}

export function UserMenu({ user, onSetStatus, onSetAvatar, onSetName }: UserMenuProps) {
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isCustomStatusDialogOpen, setIsCustomStatusDialogOpen] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [newAvatar, setNewAvatar] = useState(user.avatar || '');
  const [newPrompt, setNewPrompt] = useState(user.prompt || '');
  const [customStatus, setCustomStatus] = useState(user.status || '');

  const handleNameSubmit = () => {
    onSetName(newName);
    setIsNameDialogOpen(false);
  };

  const handleAvatarSubmit = () => {
    onSetAvatar(newAvatar);
    setIsAvatarDialogOpen(false);
  };

  const handlePromptSubmit = async () => {
    try {
      const response = await fetch('/api/users/prompt', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: newPrompt })
      });

      if (!response.ok) {
        throw new Error('Failed to update prompt');
      }

      setIsPromptDialogOpen(false);
    } catch (error) {
      console.error('Error updating user prompt:', error);
    }
  };

  const handleCustomStatusSubmit = () => {
    onSetStatus(customStatus);
    setIsCustomStatusDialogOpen(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <div className="relative flex items-center justify-center">
            <span className="text-xl">{user.avatar || '👤'}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.status || 'Set a status'}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onSetStatus("Online")}>
          🟢 Online
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSetStatus("Away")}>
          🟡 Away
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSetStatus("Busy")}>
          🔴 Busy
        </DropdownMenuItem>
        <Dialog open={isCustomStatusDialogOpen} onOpenChange={setIsCustomStatusDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              ✍️ Custom Status...
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Custom Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="What's on your mind?"
              />
              <Button onClick={handleCustomStatusSubmit}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
        <DropdownMenuSeparator />
        <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              🤖 Set Bot Prompt
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Bot Prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Personal Bot Prompt</label>
                <p className="text-sm text-muted-foreground">This prompt will be used when someone asks the bot a question in your DMs.</p>
                <Textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Example: You are a helpful assistant with a witty sense of humor. Keep responses concise but entertaining."
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={handlePromptSubmit}>Save Prompt</Button>
            </div>
          </DialogContent>
        </Dialog>
        <DropdownMenuSeparator />
        <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              ✏️ Change Name
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Name</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
              />
              <Button onClick={handleNameSubmit}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              😀 Change Avatar
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Avatar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                value={newAvatar}
                onChange={(e) => setNewAvatar(e.target.value)}
                placeholder="Enter emoji for avatar"
              />
              <Button onClick={handleAvatarSubmit}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 