import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Agent registration endpoint — called by OpenClaw when agents connect
export async function POST(request: Request) {
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });

  const supabase = createServiceClient();

  // Verify API key
  const { data: connection } = await supabase
    .from("ph_platform_connections")
    .select("id, platform_type")
    .eq("api_key_hash", apiKey)
    .eq("status", "active")
    .single();

  if (!connection) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  const { name, role, capabilities, description } = await request.json();
  if (!name) return NextResponse.json({ error: "Agent name required" }, { status: 400 });

  // Upsert agent (register or update)
  const { data, error } = await supabase
    .from("ph_agents")
    .upsert({
      name,
      role: role || null,
      platform_id: connection.id,
      capabilities: capabilities || [],
      description: description || null,
      status: "idle",
      last_active_at: new Date().toISOString(),
    }, { onConflict: "name,platform_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("ph_activity_log").insert({
    action: "agent_registered",
    agent_id: data.id,
    details: { name, role },
  });

  return NextResponse.json({ agent: data }, { status: 201 });
}
