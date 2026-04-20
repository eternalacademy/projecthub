"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, CheckSquare, FileText, Clock, GitBranch, Trash2, GripVertical,
} from "lucide-react";
import Link from "next/link";

interface Project { id: string; name: string; description: string | null; status: string; color: string; channel_url: string | null; repo_url: string | null; }
interface Task { id: string; title: string; description: string | null; status: string; priority: string; created_at: string; }
interface Note { id: string; title: string; content: string | null; category: string; pinned: boolean; updated_at: string; }
interface TimelineEvent { id: string; event_type: string; title: string; description: string | null; created_at: string; }

const statusColors: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-blue-50 text-blue-700",
  done: "bg-green-50 text-green-700",
  blocked: "bg-red-50 text-red-700",
};
const priorityColors: Record<string, string> = {
  low: "text-slate-400",
  medium: "text-amber-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [taskDialog, setTaskDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" });
  const [newNote, setNewNote] = useState({ title: "", content: "", category: "general" });

  useEffect(() => {
    fetch(`/api/projects/${projectId}`).then((r) => r.json()).then((d) => { if (d.project) setProject(d.project); });
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    const [tRes, nRes, tlRes] = await Promise.all([
      fetch(`/api/projects/${projectId}/tasks`),
      fetch(`/api/projects/${projectId}/notes`),
      fetch(`/api/projects/${projectId}/timeline`),
    ]);
    if (tRes.ok) { const d = await tRes.json(); setTasks(d.tasks || []); }
    if (nRes.ok) { const d = await nRes.json(); setNotes(d.notes || []); }
    if (tlRes.ok) { const d = await tlRes.json(); setTimeline(d.events || []); }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      setTaskDialog(false);
      setNewTask({ title: "", description: "", priority: "medium" });
      fetchData();
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote),
    });
    if (res.ok) {
      setNoteDialog(false);
      setNewNote({ title: "", content: "", category: "general" });
      fetchData();
    }
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  };

  if (!project) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading...</div>;

  const columns = ["todo", "in-progress", "done", "blocked"] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: project.color + "20" }}>
                <CheckSquare className="w-4 h-4" style={{ color: project.color }} />
              </div>
              <span className="font-semibold text-lg">{project.name}</span>
            </div>
          </div>
          <Link href="/dashboard">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center cursor-pointer">
              <span className="text-white font-bold text-xs">PH</span>
            </div>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {project.description && <p className="text-slate-500 mb-6">{project.description}</p>}

        <div className="flex gap-4 mb-6 text-sm">
          {project.repo_url && <a href={project.repo_url} target="_blank" className="text-violet-600 hover:underline">Repo →</a>}
          {project.channel_url && <a href={project.channel_url} target="_blank" className="text-violet-600 hover:underline">Channel →</a>}
          <span className="text-slate-400">{tasks.length} tasks · {notes.length} notes</span>
        </div>

        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks"><CheckSquare className="w-4 h-4 mr-1" /> Tasks</TabsTrigger>
            <TabsTrigger value="notes"><FileText className="w-4 h-4 mr-1" /> Notes</TabsTrigger>
            <TabsTrigger value="timeline"><Clock className="w-4 h-4 mr-1" /> Timeline</TabsTrigger>
          </TabsList>

          {/* TASKS TAB - Kanban */}
          <TabsContent value="tasks">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Task Board</h2>
              <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
                <DialogTrigger>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700"><Plus className="w-4 h-4 mr-1" /> Add Task</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input className="mt-1" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea className="mt-1" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <select className="w-full mt-1 border rounded-md p-2 text-sm" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">Create Task</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {columns.map((col) => (
                <div key={col} className="bg-slate-100/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-600 capitalize">{col.replace("-", " ")}</h3>
                    <Badge variant="secondary" className="text-xs">{tasks.filter((t) => t.status === col).length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter((t) => t.status === col).map((task) => (
                      <Card key={task.id} className="cursor-pointer hover:shadow-md transition">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium text-slate-800">{task.title}</p>
                          {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                            <div className="flex gap-1">
                              {columns.filter((c) => c !== col).map((c) => (
                                <button
                                  key={c}
                                  onClick={() => moveTask(task.id, c)}
                                  className="text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded hover:bg-slate-100 transition"
                                  title={`Move to ${c}`}
                                >
                                  →
                                </button>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notes</h2>
              <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
                <DialogTrigger>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700"><Plus className="w-4 h-4 mr-1" /> Add Note</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New Note</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateNote} className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input className="mt-1" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea className="mt-1 min-h-[120px]" value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">Save Note</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{note.title}</CardTitle>
                      {note.pinned && <Badge variant="secondary" className="text-xs">Pinned</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500 line-clamp-4">{note.content || "No content"}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(note.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                  </CardContent>
                </Card>
              ))}
              {notes.length === 0 && <p className="text-slate-400 text-sm col-span-3 text-center py-8">No notes yet. Add one!</p>}
            </div>
          </TabsContent>

          {/* TIMELINE TAB */}
          <TabsContent value="timeline">
            <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {timeline.map((event) => (
                <div key={event.id} className="flex gap-4 items-start">
                  <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{event.title}</p>
                    {event.description && <p className="text-xs text-slate-500">{event.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(event.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No activity yet. Create tasks and notes to see timeline events.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
