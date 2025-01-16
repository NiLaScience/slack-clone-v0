'use client';

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  context?: string[];
  sources?: Array<{
    filename: string;
    pageNumber: number;
    chunkIndex: number;
    documentId?: string;
  }>;
}

export default function DocChatPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  if (!userId) {
    redirect("/sign-in");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: "user", content: query }]);
      
      // Call our API route instead of queryMessages directly
      const response = await fetch("/api/users/docs/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      const newMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        context: data.context || [],
        sources: data.sources
      };
      setMessages(prev => [...prev, newMessage]);
      
      setQuery("");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <div className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Chat with Your Documents</h1>
          <Button variant="outline" onClick={() => router.push("/my-docs")}>
            Back to Documents
          </Button>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex flex-col gap-2 ${
                  message.role === "assistant" ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "assistant"
                      ? "bg-secondary"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Sources:</div>
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="ml-2">
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                          onClick={() => source.documentId && router.push(`/my-docs?highlight=${source.documentId}`)}
                        >
                          • {source.filename} (Page {source.pageNumber}, Section {source.chunkIndex + 1})
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
} 