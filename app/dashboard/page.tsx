"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import {
  Plus, FolderKanban, Bot, MessageSquare, Activity,
  CheckCircle2, Clock, AlertCircle, Loader2,
} from "lucide-react";

interface Agent {
  id: string; name: string; role: string | null; status: string; last_active_at: string | null;
}

interface Project {
  id: string; name: string; description: string | null; color: string; status: string;
  task_counts_by_status?: Record<string, number>;
}

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", color: "#7c3aed" });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/sign-in"); return; }
      loadData();
    });
  }, [router]);

  const loadData = async () => {
    const [projRes, agentRes, actRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/agents"),
      fetch("/api/activity?limit=10"),
    ]);
    if (projRes.ok) setProjects((await projRes.json()).projects || []);
    if (agentRes.ok) setAgents((await agentRes.json()).agents || []);
    if (actRes.ok) setActivity((await actRes.json()).activity || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });
    if (res.ok) {
      setCreateOpen(false);
      setNewProject({ name: "", description: "", color: "#7c3aed" });
      toast.success("Project created!");
      loadData();
    } else {
      toast.error("Failed to create project");
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const totalTasks = projects.reduce((sum, p) => {
    const counts = p.task_counts_by_status || {};
    return sum + Object.values(counts).reduce((a: number, b: any) => a + Number(b), 0);
  }, 0);

  const statusColors: Record<string, string> = {
    idle: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    working: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    offline: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">PH</span>
              </div>
              <span className="font-semibold hidden sm:inline">ProjectHub</span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/chat">
              <Button variant="ghost" size="sm"><MessageSquare className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Chat</span></Button>
            </Link>
            <Link href="/agents">
              <Button variant="ghost" size="sm"><Bot className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Agents</span></Button>
            </Link>
            <Link href="/docs">
              <Button variant="ghost" size="sm"><span className="hidden sm:inline">Docs</span></Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Mission Control</h1>
            <p className="text-sm text-muted-foreground">Overview of your projects and AI agents</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button><Plus className="w-4 h-4 mr-1" /> New Project</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input placeholder="e.g. Code Shelf v2" className="mt-1" value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="What's this project about?" className="mt-1" value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-1">
                    {["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"].map((c) => (
                      <button key={c} type="button" onClick={() => setNewProject({ ...newProject, color: c })}
                        className={`w-8 h-8 rounded-full transition ${newProject.color === c ? "ring-2 ring-offset-2 ring-ring" : ""}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Project</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Projects</p>
                  <p className="text-xl font-bold">{projects.filter((p) => p.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                  <p className="text-xl font-bold">{totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Agents</p>
                  <p className="text-xl font-bold">{agents.filter((a) => a.status !== "offline").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Recent Activity</p>
                  <p className="text-xl font-bold">{activity.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Projects</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FolderKanban className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No projects yet. Create one to get started.</p>
                  <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> Create Project</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {projects.map((p) => {
                  const counts = p.task_counts_by_status || {};
                  const done = Number(counts["Done"] || 0);
                  const total = Object.values(counts).reduce((a: number, b: any) => a + Number(b), 0);
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`}>
                      <Card className="hover:shadow-md transition cursor-pointer h-full">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + "20" }}>
                              <FolderKanban className="w-4 h-4" style={{ color: p.color }} />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-sm truncate">{p.name}</CardTitle>
                              <Badge variant="secondary" className="text-xs">{p.status}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                          {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>}
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>{total} tasks</span>
                            {total > 0 && <span>{Math.round((done / total) * 100)}% done</span>}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Agents + Activity */}
          <div className="space-y-6">
            {/* Agent Status */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Agents</h2>
                <Link href="/agents"><Button variant="ghost" size="sm">View all</Button></Link>
              </div>
              {agents.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <Bot className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No agents connected yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Connect OpenClaw to register agents</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {agents.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${a.status === "working" ? "bg-blue-500" : a.status === "idle" ? "bg-green-500" : a.status === "error" ? "bg-red-500" : "bg-slate-300"}`} />
                        <span className="text-sm font-medium">{a.name}</span>
                      </div>
                      <Badge variant="secondary" className={`text-xs ${statusColors[a.status] || ""}`}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              ) : (
                <div className="space-y-2">
                  {activity.map((a) => (
                    <div key={a.id} className="text-sm p-2 rounded border bg-card">
                      <span className="text-muted-foreground">{a.action}</span>
                      <span className="text-xs text-muted-foreground block">{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
