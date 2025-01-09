import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Smile } from 'lucide-react'

interface ReactionPickerProps {
  onReact: (emoji: string) => void;
}

const emojis = ['👍', '❤️', '😂', '🎉', '🤔', '👀', '🔥', '🚀'];

export function ReactionPicker({ onReact }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Smile className="h-4 w-4 mr-1" />
          React
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="grid grid-cols-4 gap-2 p-2">
          {emojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              className="text-lg"
              onClick={() => {
                onReact(emoji);
                setIsOpen(false);
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

