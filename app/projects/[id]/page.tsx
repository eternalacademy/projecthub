"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import {
  Plus, ArrowLeft, GripVertical, MessageSquare, Bot, User,
  ChevronRight, Loader2, Settings, Trash2,
} from "lucide-react";

interface Task {
  id: string; title: string; description: string | null; status: string;
  priority: string; tags: string[]; assigned_to: string | null;
  assignee_type: string | null; assignee_name?: string; comments_count?: number;
  created_by_type: string; position: number;
}

interface Project {
  id: string; name: string; description: string | null; color: string;
  columns_config: string[];
}

interface Agent {
  id: string; name: string; status: string;
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const defaultColumns = ["Backlog", "AI Ready", "In Progress", "Review", "Staging", "Done"];

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", tags: "", assignTo: "", status: "Backlog" });

  useEffect(() => { params.then((p) => setProjectId(p.id)); }, [params]);

  useEffect(() => {
    if (!projectId) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/sign-in"); return; }
      loadData();
    });
  }, [projectId, router]);

  const loadData = async () => {
    const [projRes, tasksRes, agentsRes] = await Promise.all([
      fetch(`/api/projects/${projectId}`),
      fetch(`/api/projects/${projectId}/tasks`),
      fetch("/api/agents"),
    ]);
    if (projRes.ok) setProject((await projRes.json()).project);
    if (tasksRes.ok) setTasks((await tasksRes.json()).tasks || []);
    if (agentsRes.ok) setAgents((await agentsRes.json()).agents || []);
    setLoading(false);
  };

  const loadComments = async (taskId: string) => {
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/comments`);
    if (res.ok) setComments((await res.json()).comments || []);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      tags: newTask.tags ? newTask.tags.split(",").map((t) => t.trim()) : [],
      status: newTask.status,
    };
    if (newTask.assignTo) {
      if (newTask.assignTo === "user") {
        body.assignee_type = "user";
      } else {
        body.assigned_to = newTask.assignTo;
        body.assignee_type = "agent";
      }
    }
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) {
      setCreateOpen(false);
      setNewTask({ title: "", description: "", priority: "medium", tags: "", assignTo: "", status: "Backlog" });
      toast.success("Task created!");
      loadData();
    } else {
      toast.error("Failed to create task");
    }
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Moved to ${newStatus}`);
      loadData();
    }
  };

  const addComment = async (taskId: string) => {
    if (!newComment.trim()) return;
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    if (res.ok) {
      setNewComment("");
      loadComments(taskId);
    }
  };

  const columns = project?.columns_config || defaultColumns;
  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col).sort((a, b) => a.position - b.position);
    return acc;
  }, {} as Record<string, Task[]>);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
  );

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Link href="/dashboard"><Button>Back to Dashboard</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <nav className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: project.color + "20" }}>
                <FolderKanban className="w-3.5 h-3.5" style={{ color: project.color }} />
              </div>
              <span className="font-semibold">{project.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add Task</Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6">
        <div className="flex gap-4 min-h-0" style={{ minWidth: columns.length * 300 }}>
          {columns.map((col) => (
            <div key={col} className="flex-1 min-w-[280px] max-w-[350px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{col}</h3>
                  <Badge variant="secondary" className="text-xs">{tasksByColumn[col]?.length || 0}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                  setNewTask({ ...newTask, status: col });
                  setCreateOpen(true);
                }}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {tasksByColumn[col]?.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition py-0"
                    onClick={() => { setTaskDetail(task); loadComments(task.id); }}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="text-sm font-medium leading-snug">{task.title}</p>
                        {task.priority !== "medium" && (
                          <Badge variant="secondary" className={`text-xs shrink-0 ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                          {task.tags?.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs py-0">{tag}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {(task.comments_count || 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <MessageSquare className="w-3 h-3" />{task.comments_count}
                            </span>
                          )}
                          {task.assignee_type === "agent" && (
                            <Bot className="w-3.5 h-3.5 text-blue-500" />
                          )}
                          {task.assignee_type === "user" && (
                            <User className="w-3.5 h-3.5 text-green-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div><Label>Title</Label><Input className="mt-1" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required /></div>
            <div><Label>Description</Label><Textarea className="mt-1" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <select className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <Label>Assign To</Label>
                <select className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm" value={newTask.assignTo} onChange={(e) => setNewTask({ ...newTask, assignTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  <option value="user">You</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Tags (comma-separated)</Label><Input className="mt-1" placeholder="AIReady, Feature" value={newTask.tags} onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })} /></div>
            <Button type="submit" className="w-full">Create Task</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!taskDetail} onOpenChange={(open) => { if (!open) setTaskDetail(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {taskDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{taskDetail.title}</DialogTitle>
                  <Badge variant="secondary" className={priorityColors[taskDetail.priority]}>{taskDetail.priority}</Badge>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {taskDetail.description && <p className="text-sm text-muted-foreground">{taskDetail.description}</p>}

                <div className="flex gap-2 flex-wrap">
                  {taskDetail.tags?.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                </div>

                {/* Move Task */}
                <div>
                  <Label className="text-xs">Move to</Label>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {columns.map((col) => (
                      <Button key={col} size="sm" variant={taskDetail.status === col ? "default" : "outline"}
                        onClick={() => { moveTask(taskDetail.id, col); setTaskDetail({ ...taskDetail, status: col }); }}
                        className="text-xs">{col}</Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {taskDetail.assignee_type === "agent" && <><Bot className="w-3.5 h-3.5" /> Assigned to agent</>}
                  {taskDetail.assignee_type === "user" && <><User className="w-3.5 h-3.5" /> Assigned to you</>}
                  {!taskDetail.assignee_type && "Unassigned"}
                </div>

                {/* Comments */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3">Comments ({comments.length})</h4>
                  <div className="space-y-3 mb-3">
                    {comments.map((c: any) => (
                      <div key={c.id} className="flex gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className={c.author_type === "agent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700"}>
                            {c.author_type === "agent" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{c.author_name}</span>
                            <Badge variant="secondary" className="text-xs py-0">{c.author_type}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-sm mt-0.5">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addComment(taskDetail.id); }} />
                    <Button size="sm" onClick={() => addComment(taskDetail.id)}>Send</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FolderKanban(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>
    </svg>
  );
}
