import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("ph_projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get task counts per project per status
  const projectsWithCounts = await Promise.all((data || []).map(async (p) => {
    const { data: tasks } = await supabase
      .from("ph_tasks")
      .select("status")
      .eq("project_id", p.id);
    const task_counts_by_status: Record<string, number> = {};
    (tasks || []).forEach((t) => {
      task_counts_by_status[t.status] = (task_counts_by_status[t.status] || 0) + 1;
    });
    return { ...p, task_counts_by_status };
  }));

  return NextResponse.json({ projects: projectsWithCounts });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, color } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("ph_projects")
    .insert({ name, description, color: color || "#7c3aed" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("ph_activity_log").insert({
    project_id: data.id, action: "project_created", details: { name },
  });

  return NextResponse.json({ project: data }, { status: 201 });
}
