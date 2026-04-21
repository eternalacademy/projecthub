"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";

interface Agent {
  id: string; name: string; role: string | null; status: string;
  capabilities: string[]; description: string | null; last_active_at: string | null;
}

const statusColors: Record<string, string> = {
  idle: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  working: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  offline: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusDot: Record<string, string> = {
  idle: "bg-green-500", working: "bg-blue-500", offline: "bg-slate-300", error: "bg-red-500",
};

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/sign-in"); return; }
      fetch("/api/agents").then(r => r.json()).then(d => { setAgents(d.agents || []); setLoading(false); });
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <span className="font-semibold">Agents</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">AI Agents</h1>
        <p className="text-sm text-muted-foreground mb-6">Agents registered from connected platforms (OpenClaw)</p>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h2 className="font-semibold mb-1">No agents registered</h2>
              <p className="text-sm text-muted-foreground mb-4">Connect OpenClaw to auto-register agents via the API</p>
              <p className="text-xs text-muted-foreground">API endpoint: POST /api/agents/register</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {agents.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${statusDot[a.status]}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{a.name}</p>
                        {a.role && <p className="text-xs text-muted-foreground">{a.role}</p>}
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusColors[a.status]}>{a.status}</Badge>
                  </div>
                  {a.description && <p className="text-sm text-muted-foreground mb-2">{a.description}</p>}
                  {a.capabilities?.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {a.capabilities.map((c) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                    </div>
                  )}
                  {a.last_active_at && (
                    <p className="text-xs text-muted-foreground mt-2">Last active: {new Date(a.last_active_at).toLocaleString()}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
