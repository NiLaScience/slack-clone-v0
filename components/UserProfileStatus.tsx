import React, { useState, useEffect } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CircleStatus } from "@/components/ui/circle-status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Edit2, Check, X } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'

type UserProfileStatusProps = {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    status?: string
    isOnline?: boolean
  }
  onSetUserStatus: (newStatus: string) => void
  onSetUserAvatar: (newEmoji: string) => void
  onSetUserName: (newName: string) => void
}

const predefinedStatuses = ['Online', 'Busy', 'Away', 'Custom']
const emojiOptions = ['😀','😎','👾','🐱','🐶','🍀','🐸','🔥','🚀','❤️']

export function UserProfileStatus({ user, onSetUserStatus, onSetUserAvatar, onSetUserName }: UserProfileStatusProps) {
  const [open, setOpen] = useState(false)
  const [isCustom, setIsCustom] = useState(false)
  const [customStatus, setCustomStatus] = useState('')
  const [editName, setEditName] = useState(false)
  const [tempName, setTempName] = useState(user.name)
  const [editStatus, setEditStatus] = useState(false)
  const [tempStatus, setTempStatus] = useState('')

  useEffect(() => {
    if (user.status && !predefinedStatuses.includes(user.status)) {
      setIsCustom(true)
      setCustomStatus(user.status)
      setTempStatus(user.status)
    } else {
      setIsCustom(false)
      setCustomStatus('')
      setTempStatus(user.status || '')
    }
    setTempName(user.name)
  }, [user.status, user.name])

  const handleSelectEmoji = (emojiData: EmojiClickData) => {
    onSetUserAvatar(emojiData.emoji)
  }

  const handleSelectStatus = (newStatus: string) => {
    if (newStatus === 'Custom') {
      setIsCustom(true)
      setEditStatus(true)
    } else {
      onSetUserStatus(newStatus)
      setIsCustom(false)
      setEditStatus(false)
    }
  }

  const handleStatusConfirm = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tempStatus.trim()) {
      onSetUserStatus(tempStatus.trim())
      setEditStatus(false)
    }
  }

  const handleStatusBlur = () => {
    if (!editStatus) return
    if (tempStatus.trim() && tempStatus.trim() !== user.status) {
      onSetUserStatus(tempStatus.trim())
    }
    setEditStatus(false)
  }

  const handleNameConfirm = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tempName.trim()) {
      await onSetUserName(tempName.trim())
      setEditName(false)
    }
  }

  const handleNameBlur = async () => {
    if (tempName.trim() && tempName.trim() !== user.name) {
      await onSetUserName(tempName.trim())
    }
    setEditName(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing via explicit actions (close button or escape)
    if (!newOpen && !open) return
    setOpen(newOpen)
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="relative flex items-center w-full gap-2 px-2 hover:bg-gray-700/50"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOpen(!open)
            }}
          >
            <div className="relative flex items-center justify-center w-8 h-8">
              <span className="text-2xl">{user.avatar ?? '🤔'}</span>
              <CircleStatus isOnline={user.isOnline} status={user.status} />
            </div>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-sm font-medium truncate w-full">
                {user.name}
              </span>
              <span className="text-xs text-gray-400 truncate w-full">
                {user.status || 'Set a status'}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4" 
          align="start"
          onEscapeKeyDown={() => setOpen(false)}
          onInteractOutside={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Profile Settings</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Name section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Display Name</Label>
                {!editName ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setEditName(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleNameBlur}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editName ? (
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleNameConfirm}
                  onBlur={handleNameBlur}
                  className="h-8"
                  autoFocus
                />
              ) : (
                <p className="text-sm">{user.name}</p>
              )}
            </div>

            <Separator />

            {/* Email section */}
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <Separator />

            {/* Avatar section */}
            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="w-full">
                <EmojiPicker
                  onEmojiClick={handleSelectEmoji}
                  autoFocusSearch={false}
                  width="100%"
                  height={350}
                />
              </div>
            </div>

            <Separator />

            {/* Status section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Status</Label>
                {isCustom && (
                  <>
                    {!editStatus ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setEditStatus(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleStatusBlur}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="grid gap-2">
                <Select
                  value={isCustom ? 'Custom' : (user.status || '')}
                  onValueChange={handleSelectStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Set a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isCustom && (
                  <>
                    {editStatus ? (
                      <Input
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value)}
                        onKeyDown={handleStatusConfirm}
                        onBlur={handleStatusBlur}
                        placeholder="What's your status?"
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm">{user.status}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 