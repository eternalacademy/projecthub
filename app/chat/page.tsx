"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import { ArrowLeft, Bot, User, Send, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string; sender_type: "agent" | "user"; sender_name: string; content: string; created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/sign-in"); return; }
      loadMessages();
    });
  }, [router]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loadMessages = async () => {
    const res = await fetch("/api/chat");
    if (res.ok) setMessages((await res.json()).messages || []);
    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const content = input;
    setInput("");
    setSending(true);

    // Optimistically add user message
    setMessages((prev) => [...prev, {
      id: "temp-" + Date.now(), sender_type: "user", sender_name: "You", content, created_at: new Date().toISOString(),
    }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev.filter((m) => !m.id.startsWith("temp-")), ...data.messages]);
    } else {
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold">Agent Chat</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex-1 max-w-3xl w-full mx-auto flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h2 className="font-semibold text-lg mb-1">Chat with your orchestrator</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Ask the orchestrator agent to create tasks, assign agents, check status, or coordinate work across your AI team.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.sender_type === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={m.sender_type === "agent" ? "bg-primary/10 text-primary" : "bg-green-100 text-green-700"}>
                    {m.sender_type === "agent" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  m.sender_type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className={`text-xs mt-1 ${m.sender_type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.sender_name} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary"><Bot className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input placeholder="Ask your orchestrator agent..." value={input} onChange={(e) => setInput(e.target.value)} className="flex-1" />
            <Button type="submit" disabled={sending || !input.trim()}><Send className="w-4 h-4" /></Button>
          </form>
        </div>
      </div>
    </div>
  );
}
