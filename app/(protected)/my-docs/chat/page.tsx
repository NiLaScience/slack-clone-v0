'use client';

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { queryMessages } from "@/lib/rag";
import { useRouter } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  context?: string[];
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
      
      // Get relevant documents
      const relevantDocs = await queryMessages(query, undefined, userId);
      const context = relevantDocs
        ?.map(doc => (typeof doc.text === 'string' ? doc.text : ''))
        .filter(Boolean);

      // Call OpenAI with context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant answering questions about the user's personal documents. 
                       Below is relevant context from their documents:\n\n${context?.join("\n\n") || ''}`
            },
            { role: "user", content: query }
          ]
        })
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      const newMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        context: context || []
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
                {message.context && (
                  <div className="text-xs text-muted-foreground">
                    Based on {message.context.length} document snippets
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