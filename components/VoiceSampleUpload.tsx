import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Mic, Upload } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { Loader2 } from 'lucide-react'

interface VoiceSampleUploadProps {
  entityId: string
  entityType: "user" | "channel"
  currentVoiceStatus?: string | null
  currentVoiceSampleUrl?: string | null
  onUploadComplete?: () => void
  onDataRefresh?: () => Promise<void>
}

export function VoiceSampleUpload({
  entityId,
  entityType,
  currentVoiceStatus,
  currentVoiceSampleUrl,
  onUploadComplete,
  onDataRefresh
}: VoiceSampleUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [justUploaded, setJustUploaded] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    console.log('Props received:', { entityId, entityType, currentVoiceStatus, currentVoiceSampleUrl });
  }, [entityId, entityType, currentVoiceStatus, currentVoiceSampleUrl]);

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;
    let attempts = 0;
    const MAX_ATTEMPTS = 15; // 30 seconds total

    const pollStatus = async () => {
      try {
        console.log('Polling for status update...');
        const response = await fetch('/api/getData');
        const data = await response.json();
        
        // Find the relevant entity based on type
        const entity = entityType === 'user' 
          ? data.users.find((u: any) => u.id === entityId)
          : data.channels.find((c: any) => c.id === entityId);
          
        if (!entity) {
          console.error('Entity not found in response');
          return;
        }

        console.log('Got entity:', entity);
        attempts++;
        
        if (entity.voiceStatus === 'ready' || entity.voiceStatus === 'failed' || attempts >= MAX_ATTEMPTS) {
          clearInterval(pollingInterval);
          if (onDataRefresh) {
            await onDataRefresh();
          }
          setJustUploaded(false);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    if (justUploaded) {
      pollingInterval = setInterval(pollStatus, 2000);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [justUploaded, entityId, entityType, onDataRefresh]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!entityId) {
      toast({
        title: "Upload failed",
        description: "Invalid entity ID",
        variant: "destructive",
      })
      return
    }

    console.log('Selected file:', file);

    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true);
    console.log('Starting upload...');

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityId", entityId);
      formData.append("entityType", entityType);

      console.log('Uploading with data:', {
        entityId,
        entityType,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

      const response = await fetch("/api/voice-sample", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      setJustUploaded(true);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false);
    }
  }

  const currentFilename = currentVoiceSampleUrl?.split('/').pop()?.split('-').slice(1).join('-')

  return (
    <div className="space-y-2">
      {!currentVoiceStatus && !currentVoiceSampleUrl && !isUploading && currentVoiceStatus !== "pending" && !justUploaded && (
        <p className="text-sm text-muted-foreground">
          {entityId ? "No voice sample uploaded yet" : "Loading..."}
        </p>
      )}
      
      {(currentVoiceStatus === "pending" || justUploaded) && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm">Processing voice sample...</p>
        </div>
      )}

      {currentVoiceStatus === "ready" && currentFilename && (
        <p className="text-sm text-muted-foreground">
          Current voice sample: {currentFilename}
        </p>
      )}

      {currentVoiceStatus === "failed" && (
        <p className="text-sm text-destructive">
          Voice sample processing failed. Please try again.
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading || !entityId}
          onClick={() => document.getElementById(`file-upload-${entityId}`)?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : currentVoiceStatus === "ready" ? (
            "Change voice sample"
          ) : !entityId ? (
            "Loading..."
          ) : (
            "Upload voice sample"
          )}
        </Button>
        <input
          id={`file-upload-${entityId}`}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
} 