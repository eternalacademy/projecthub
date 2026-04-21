import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

async function authenticateAgent(request: Request) {
  const apiKey = request.headers.get("X-API-Key");
  const agentName = request.headers.get("X-Agent-Name");
  if (!apiKey || !agentName) return null;

  const supabase = createServiceClient();
  const { data: connection } = await supabase
    .from("ph_platform_connections")
    .select("id")
    .eq("api_key_hash", apiKey)
    .eq("status", "active")
    .single();
  if (!connection) return null;

  const { data: agent } = await supabase
    .from("ph_agents")
    .select("id, name, status")
    .eq("name", agentName)
    .eq("platform_id", connection.id)
    .single();
  if (!agent) return null;

  // Update last active
  await supabase.from("ph_agents").update({ last_active_at: new Date().toISOString() }).eq("id", agent.id);

  return { agent, connectionId: connection.id };
}

// GET /api/agent/boards/[id] — Get board with tasks
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateAgent(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: project } = await supabase.from("ph_projects").select("*").eq("id", id).single();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data: tasks } = await supabase
    .from("ph_tasks")
    .select("*, ph_comments(count)")
    .eq("project_id", id)
    .order("position");

  const tasksWithCounts = (tasks || []).map((t: any) => ({
    ...t,
    comments_count: t.ph_comments?.[0]?.count || 0,
  }));

  return NextResponse.json({ project, tasks: tasksWithCounts });
}
