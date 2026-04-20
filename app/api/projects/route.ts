import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("ph_projects")
    .select("*, ph_tasks(count), ph_notes(count)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, color, icon, channel_url, repo_url } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("ph_projects")
    .insert({ user_id: user.id, name, description, color, icon, channel_url, repo_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log timeline event
  await supabase.from("ph_timeline").insert({
    project_id: data.id,
    event_type: "project_created",
    title: "Project created",
    description: `${name} was created`,
  });

  return NextResponse.json({ project: data }, { status: 201 });
}
