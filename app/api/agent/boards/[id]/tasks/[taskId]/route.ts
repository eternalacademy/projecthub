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

// PATCH /api/agent/boards/[id]/tasks/[taskId] — Agent updates a task
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const auth = await authenticateAgent(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, taskId } = await params;
  const updates = await request.json();
  updates.updated_at = new Date().toISOString();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("ph_tasks").update(updates).eq("id", taskId).eq("project_id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (updates.status) {
    await supabase.from("ph_activity_log").insert({
      project_id: id, task_id: taskId, agent_id: auth.agent.id,
      action: "agent_moved_task", details: { new_status: updates.status },
    });
  }

  return NextResponse.json({ task: data });
}
