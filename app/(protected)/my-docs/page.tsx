'use client';

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Pusher from 'pusher-js';

interface UserDocument {
  id: string;
  filename: string;
  fileUrl: string;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export default function MyDocsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [documents, setDocuments] = useState<UserDocument[]>([]);

  const fetchDocuments = async () => {
    const url = "/api/users/docs";
    console.log("Fetching documents from:", url);
    try {
      const res = await fetch(url);
      console.log("Response status:", res.status);
      if (!res.ok) {
        const error = await res.json();
        console.log("Error response:", error);
        throw new Error(error.message || 'Failed to fetch documents');
      }
      const data = await res.json();
      console.log("Received data:", data);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setDocuments([]);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    fetchDocuments();

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to user's channel
    const channel = pusher.subscribe(`user-${user.id}`);

    // Listen for document updates
    channel.bind('document-created', (data: UserDocument) => {
      setDocuments(prev => [...prev, data]);
    });

    channel.bind('document-deleted', (data: { id: string }) => {
      setDocuments(prev => prev.filter(doc => doc.id !== data.id));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [user, router]);

  const handleDelete = async (documentId: string) => {
    try {
      const res = await fetch(`/api/users/docs/${documentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-4 top-4" 
        onClick={() => router.push("/")}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Documents</h1>
          <div className="flex gap-2 mr-12">
            <Button variant="outline" onClick={() => router.push("/my-docs/chat")}>
              Chat with Documents
            </Button>
            <FileUpload
              endpoint="/api/users/docs"
              accept="application/pdf"
              onUploadComplete={fetchDocuments}
            >
              <Button>Upload PDF</Button>
            </FileUpload>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {documents.map((doc: UserDocument) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">{doc.filename}</h3>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {doc.filename}? This action cannot be undone.
                        The document will be removed from your personal store and won't be available for queries.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(doc.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Document
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <h3 className="font-semibold mb-1">No documents yet</h3>
                <p>Upload a PDF to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 