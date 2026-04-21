import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("ph_chat_messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await request.json();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  // Save user message
  const { data: userMsg } = await supabase
    .from("ph_chat_messages")
    .insert({ sender_type: "user", sender_name: "You", content })
    .select()
    .single();

  // For v1, return a placeholder orchestrator response
  // In v2, this will call OpenClaw's orchestrator agent
  const { data: agentMsg } = await supabase
    .from("ph_chat_messages")
    .insert({
      sender_type: "agent",
      sender_name: "Orchestrator",
      content: `[Orchestrator integration pending] I received your message: "${content}". Connect OpenClaw to enable full agent orchestration.`,
    })
    .select()
    .single();

  return NextResponse.json({
    messages: [userMsg, agentMsg].filter(Boolean),
  });
}
