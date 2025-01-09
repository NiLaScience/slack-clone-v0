import React, { useState, useEffect } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CircleStatus } from "@/components/ui/circle-status"

type UserProfileStatusProps = {
  user: {
    id: string
    name: string
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
  // Whether the user picked “Custom”
  const [isCustom, setIsCustom] = useState(false)
  const [customStatus, setCustomStatus] = useState('')
  const [editName, setEditName] = useState(false)
  const [tempName, setTempName] = useState(user.name)

  // Sync local custom input and isCustom when user.status changes
  useEffect(() => {
    if (user.status && !predefinedStatuses.includes(user.status)) {
      setIsCustom(true)
      setCustomStatus(user.status)
    } else {
      setIsCustom(false)
      setCustomStatus('')
    }
    setTempName(user.name) // Sync name if updated externally
  }, [user.status, user.name])

  const handleSelectEmoji = (emoji: string) => {
    onSetUserAvatar(emoji)
    setOpen(false)
  }

  const handleSelectStatus = (newStatus: string) => {
    if (newStatus === 'Custom') {
      setIsCustom(true)
      // Keep the popover open so user can type
    } else {
      onSetUserStatus(newStatus)
      setIsCustom(false)
      setOpen(false)
    }
  }

  const handleCustomStatusEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Close & save on Enter
    if (e.key === 'Enter') {
      onSetUserStatus(customStatus)
      setOpen(false)
    }
  }

  const handleCustomStatusBlur = () => {
    // Optionally save on blur
    if (customStatus.trim()) {
      onSetUserStatus(customStatus.trim())
    }
  }

  const handleNameConfirm = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await onSetUserName(tempName);
      setEditName(false);
    }
  }

  const handleNameBlur = async () => {
    if (tempName.trim() !== user.name) {
      await onSetUserName(tempName.trim());
    }
    setEditName(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center space-x-2 outline-none"
            title="Change status"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">{user.avatar ?? '🤔'}</span>
              <CircleStatus isOnline={user.isOnline} />
            </div>
            <span className="text-sm">
              {editName ? tempName : user.name}
              {user.status ? ` - ${user.status}` : ' (Set status)'}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="flex flex-col space-y-2 bg-white shadow-md rounded-md p-3">
            {/* Editable name */}
            {!editName ? (
              <div className="flex justify-between items-center">
                <span className="font-semibold">{user.name}</span>
                <button
                  onClick={() => setEditName(true)}
                  className="text-xs underline text-blue-600"
                >
                  Change name
                </button>
              </div>
            ) : (
              <input
                className="border border-gray-300 rounded p-1 text-sm w-full"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleNameConfirm}
                onBlur={handleNameBlur}
                autoFocus
              />
            )}

            {/* Emoji chooser */}
            <div className="flex flex-wrap gap-1">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  className="rounded hover:bg-gray-200 px-2"
                  onClick={() => handleSelectEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {predefinedStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleSelectStatus(s)}
                className="py-1 text-left hover:bg-gray-100 text-sm"
              >
                {s}
              </button>
            ))}
            {/* Only show custom input if user chose “Custom” */}
            {isCustom && (
              <input
                className="border border-gray-300 rounded p-1 text-sm w-full"
                placeholder="Enter custom status"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                onKeyDown={handleCustomStatusEnter}
                onBlur={handleCustomStatusBlur}
              />
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 