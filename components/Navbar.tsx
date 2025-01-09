import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">ChatGenius</h1>
      </div>
      {/* Add any additional navbar items here */}
    </nav>
  )
}

