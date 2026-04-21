import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

async function authenticateAgent(request: Request) {
  const apiKey = request.headers.get("X-API-Key");
  const agentName = request.headers.get("X-Agent-Name");
  if (!apiKey || !agentName) return null;
  const supabase = createServiceClient();
  const { data: connection } = await supabase
    .from("ph_platform_connections").select("id").eq("api_key_hash", apiKey).eq("status", "active").single();
  if (!connection) return null;
  const { data: agent } = await supabase
    .from("ph_agents").select("id, name").eq("name", agentName).eq("platform_id", connection.id).single();
  if (!agent) return null;
  await supabase.from("ph_agents").update({ last_active_at: new Date().toISOString() }).eq("id", agent.id);
  return { agent, connectionId: connection.id };
}

// POST /api/agent/boards/[id]/tasks — Agent creates a task
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateAgent(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("ph_tasks").select("position").eq("project_id", id).eq("status", body.status || "Backlog")
    .order("position", { ascending: false }).limit(1);
  const position = (existing?.[0]?.position || 0) + 1;

  const { data, error } = await supabase.from("ph_tasks").insert({
    project_id: id,
    title: body.title,
    description: body.description,
    status: body.status || "Backlog",
    priority: body.priority || "medium",
    tags: body.tags || [],
    assigned_to: body.assigned_to || auth.agent.id,
    assignee_type: body.assigned_to ? "agent" : "agent",
    created_by: auth.agent.id,
    created_by_type: "agent",
    position,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("ph_activity_log").insert({
    project_id: id, task_id: data.id, agent_id: auth.agent.id,
    action: "agent_created_task", details: { title: body.title },
  });

  return NextResponse.json({ task: data }, { status: 201 });
}
