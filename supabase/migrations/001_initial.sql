-- ProjectHub v2 — Mission Control for Human + AI Agent Teams
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PLATFORM CONNECTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS ph_platform_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_type TEXT NOT NULL DEFAULT 'openclaw',
  api_key_hash TEXT NOT NULL UNIQUE,
  label TEXT,
  config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AGENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS ph_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  platform_id UUID REFERENCES ph_platform_connections(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'offline', 'error')),
  capabilities JSONB DEFAULT '[]',
  description TEXT,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, platform_id)
);

-- ==========================================
-- PROJECTS
-- ==========================================
CREATE TABLE IF NOT EXISTS ph_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#7c3aed',
  icon TEXT DEFAULT 'folder',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  columns_config JSONB DEFAULT '["Backlog", "AI Ready", "In Progress", "Review", "Staging", "Done"]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TASKS
-- ==========================================
CREATE TABLE IF NOT EXISTS ph_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES ph_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Backlog',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  tags TEXT[] DEFAULT '{}',
  assigned_to UUID,
  assignee_type TEXT CHECK (assignee_type IN ('agent', 'user', NULL)),
  created_by UUID,
  created_by_type TEXT DEFAULT 'user' CHECK (created_by_type IN ('agent', 'user')),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- COMMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS ph_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES ph_tasks(id) ON DELETE CASCADE,
  author_id UUID,
  author_type TEXT NOT NULL DEFAULT 'user' CHECK (author_type IN ('agent', 'user')),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ACTIVITY LOG
-- ==========================================
CREATE TABLE IF NOT EXISTS ph_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES ph_projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES ph_tasks(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES ph_agents(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CHAT MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS ph_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('agent', 'user')),
  sender_id UUID,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AGENT METRICS (daily rollup)
-- ==========================================
CREATE TABLE IF NOT EXISTS ph_agent_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES ph_agents(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tasks_completed INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  comments_posted INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  tokens_used BIGINT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  UNIQUE(agent_id, date)
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_ph_tasks_project ON ph_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_ph_tasks_status ON ph_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_ph_tasks_assigned ON ph_tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ph_comments_task ON ph_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_ph_activity_project ON ph_activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_ph_activity_created ON ph_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ph_chat_created ON ph_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ph_agents_status ON ph_agents(status);

-- ==========================================
-- Enable RLS (Row Level Security)
-- ==========================================
ALTER TABLE ph_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_agent_metrics ENABLE ROW LEVEL SECURITY;

-- For v1 (single user), allow all operations for authenticated users
-- This will be tightened in v2 for multi-user
CREATE POLICY "Authenticated users can manage all" ON ph_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all" ON ph_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all" ON ph_comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all" ON ph_agents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all" ON ph_activity_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all" ON ph_chat_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all" ON ph_agent_metrics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all" ON ph_platform_connections FOR ALL USING (auth.role() = 'authenticated');

-- Service role can do everything (for API endpoints)
CREATE POLICY "Service role full access" ON ph_projects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON ph_tasks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON ph_comments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON ph_agents FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON ph_activity_log FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON ph_chat_messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON ph_agent_metrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON ph_platform_connections FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- Drop old tables if they exist (from v1)
-- ==========================================
-- Only run these if upgrading from v1:
-- DROP TABLE IF EXISTS ph_timeline CASCADE;
