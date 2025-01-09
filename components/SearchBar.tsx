import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <input
        className="flex-1 bg-gray-700 text-white border-gray-600 rounded p-2 focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder:text-gray-400"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit" className="ml-2 text-sm bg-gray-700 text-white hover:bg-gray-600 rounded px-3 py-2">
        Search
      </button>
    </form>
  )
}

