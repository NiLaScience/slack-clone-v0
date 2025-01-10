import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface CreateChannelDialogProps {
  onSubmit: (name: string, isPrivate: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChannelDialog({ onSubmit, open, onOpenChange }: CreateChannelDialogProps) {
  const [name, setName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name, isPrivate)
      setName('')
      setIsPrivate(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter channel name"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor="private">Private Channel</Label>
          </div>
          <Button type="submit" className="w-full">Create Channel</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

