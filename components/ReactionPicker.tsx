import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from 'lucide-react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'

interface ReactionPickerProps {
  onReact: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export function ReactionPicker({ onReact, trigger }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onReact(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <button className="text-gray-400 hover:text-gray-600">
            <Smile className="h-4 w-4" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[352px] p-0">
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          autoFocusSearch={false}
          width="100%"
          height={400}
        />
      </PopoverContent>
    </Popover>
  );
}

