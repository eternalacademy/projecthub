import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updates = await request.json();
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("ph_tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("project_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log status changes
  if (updates.status) {
    await supabase.from("ph_activity_log").insert({
      project_id: id, task_id: taskId, action: "task_moved",
      details: { new_status: updates.status },
    });
  }

  return NextResponse.json({ task: data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("ph_tasks").delete().eq("id", taskId).eq("project_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("ph_activity_log").insert({
    project_id: id, task_id: taskId, action: "task_deleted",
  });

  return NextResponse.json({ success: true });
}
