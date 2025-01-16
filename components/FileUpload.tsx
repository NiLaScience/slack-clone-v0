import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface FileUploadProps {
  endpoint: string
  accept?: string
  children: ReactNode
}

export function FileUpload({
  endpoint,
  accept,
  children
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const startUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Upload failed')
      }

      router.refresh()
    } catch (error) {
      console.error('Upload error:', error)
      // You might want to show a toast notification here
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        accept={accept}
        onChange={startUpload}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      {children}
    </div>
  )
} 