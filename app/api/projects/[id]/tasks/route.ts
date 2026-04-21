import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("ph_tasks")
    .select("*, ph_comments(count)")
    .eq("project_id", id)
    .order("position", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get agent names for assigned tasks
  const agentIds = (data || []).map((t: any) => t.assigned_to).filter(Boolean);
  let agents: any[] = [];
  if (agentIds.length > 0) {
    const { data: agentData } = await supabase.from("ph_agents").select("id, name").in("id", agentIds);
    agents = agentData || [];
  }
  const agentMap = Object.fromEntries(agents.map((a: any) => [a.id, a.name]));

  const tasks = (data || []).map((t: any) => ({
    ...t,
    assignee_name: t.assignee_type === "agent" ? agentMap[t.assigned_to] : t.assignee_type === "user" ? "You" : null,
    comments_count: t.ph_comments?.[0]?.count || 0,
  }));

  return NextResponse.json({ tasks });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  // Get max position in target column
  const { data: existing } = await supabase
    .from("ph_tasks")
    .select("position")
    .eq("project_id", id)
    .eq("status", body.status || "Backlog")
    .order("position", { ascending: false })
    .limit(1);

  const position = (existing?.[0]?.position || 0) + 1;

  const { data, error } = await supabase
    .from("ph_tasks")
    .insert({
      project_id: id,
      title: body.title,
      description: body.description,
      status: body.status || "Backlog",
      priority: body.priority || "medium",
      tags: body.tags || [],
      assigned_to: body.assigned_to || null,
      assignee_type: body.assignee_type || null,
      created_by_type: "user",
      position,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("ph_activity_log").insert({
    project_id: id, task_id: data.id, action: "task_created",
    details: { title: body.title, status: body.status },
  });

  return NextResponse.json({ task: data }, { status: 201 });
}
