export interface Agent {
  id: string;
  name: string;
  role: string | null;
  platform_id: string | null;
  status: "idle" | "working" | "offline" | "error";
  capabilities: string[];
  description: string | null;
  last_active_at: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  status: "active" | "paused" | "completed" | "archived";
  columns_config: string[];
  created_at: string;
  updated_at: string;
  // Joined counts
  task_count?: number;
  task_counts_by_status?: Record<string, number>;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
  assigned_to: string | null;
  assignee_type: "agent" | "user" | null;
  created_by: string | null;
  created_by_type: "agent" | "user";
  position: number;
  created_at: string;
  updated_at: string;
  // Joined
  assignee_name?: string;
  comments_count?: number;
}

export interface Comment {
  id: string;
  task_id: string;
  author_id: string | null;
  author_type: "agent" | "user";
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  sender_type: "agent" | "user";
  sender_id: string | null;
  sender_name: string;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  project_id: string | null;
  task_id: string | null;
  agent_id: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
}
