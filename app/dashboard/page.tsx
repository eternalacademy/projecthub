"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Plus, Folder, CheckSquare, FileText, Clock, ArrowRight, MoreHorizontal } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string;
  icon: string;
  channel_url: string | null;
  repo_url: string | null;
  updated_at: string;
  ph_tasks: { count: number }[];
  ph_notes: { count: number }[];
}

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  paused: "bg-amber-50 text-amber-700",
  completed: "bg-blue-50 text-blue-700",
  archived: "bg-slate-100 text-slate-500",
};

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", color: "#7c3aed", repo_url: "", channel_url: "" });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/sign-in"); return; }
      fetchProjects();
    });
  }, [router]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects || []);
    }
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
      setNewProject({ name: "", description: "", color: "#7c3aed", repo_url: "", channel_url: "" });
      fetchProjects();
    }
  };

  const taskCounts = (p: Project) => p.ph_tasks?.[0]?.count || 0;
  const noteCounts = (p: Project) => p.ph_notes?.[0]?.count || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PH</span>
            </div>
            <span className="font-semibold text-lg text-slate-900">ProjectHub</span>
          </Link>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-1" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input placeholder="e.g. ProposalPilot" className="mt-1" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="What's this project about?" className="mt-1" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Repo URL</Label>
                    <Input placeholder="https://github.com/..." className="mt-1" value={newProject.repo_url} onChange={(e) => setNewProject({ ...newProject, repo_url: e.target.value })} />
                  </div>
                  <div>
                    <Label>Channel URL</Label>
                    <Input placeholder="Slack channel link" className="mt-1" value={newProject.channel_url} onChange={(e) => setNewProject({ ...newProject, channel_url: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-1">
                    {["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewProject({ ...newProject, color: c })}
                        className={`w-8 h-8 rounded-full transition ${newProject.color === c ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">Create Project</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Your Projects</h1>
          <p className="text-slate-500 mt-1">Track tasks, notes, and decisions across all your AI agent projects.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 rounded-lg"><Folder className="w-5 h-5 text-violet-600" /></div>
                <div>
                  <p className="text-sm text-slate-500">Active Projects</p>
                  <p className="text-2xl font-bold text-slate-900">{projects.filter((p) => p.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg"><CheckSquare className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-slate-500">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">{projects.reduce((a, p) => a + taskCounts(p), 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg"><FileText className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="text-sm text-slate-500">Notes</p>
                  <p className="text-2xl font-bold text-slate-900">{projects.reduce((a, p) => a + noteCounts(p), 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Folder className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 mb-2">No projects yet</h2>
              <p className="text-slate-500 mb-6">Create your first project to get started.</p>
              <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-1" /> Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="hover:shadow-lg transition cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + "20" }}>
                          <Folder className="w-5 h-5" style={{ color: p.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{p.name}</CardTitle>
                          <Badge variant="secondary" className={`text-xs mt-1 ${statusColors[p.status] || ""}`}>{p.status}</Badge>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {p.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{p.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {taskCounts(p)} tasks</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {noteCounts(p)} notes</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(p.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
