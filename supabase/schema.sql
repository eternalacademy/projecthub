-- ProjectHub Database Schema

-- Projects
CREATE TABLE IF NOT EXISTS ph_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'folder',
  channel_url TEXT,
  repo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS ph_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES ph_projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assignee TEXT,
  due_date DATE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notes
CREATE TABLE IF NOT EXISTS ph_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES ph_projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Decisions Log
CREATE TABLE IF NOT EXISTS ph_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES ph_projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  decision TEXT NOT NULL,
  rationale TEXT,
  alternatives TEXT,
  decided_at TIMESTAMPTZ DEFAULT now()
);

-- Timeline / Activity Feed
CREATE TABLE IF NOT EXISTS ph_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES ph_projects(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE ph_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects" ON ph_projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own tasks" ON ph_tasks FOR ALL USING (project_id IN (SELECT id FROM ph_projects WHERE user_id = auth.uid()));
CREATE POLICY "Users can CRUD own notes" ON ph_notes FOR ALL USING (project_id IN (SELECT id FROM ph_projects WHERE user_id = auth.uid()));
CREATE POLICY "Users can CRUD own decisions" ON ph_decisions FOR ALL USING (project_id IN (SELECT id FROM ph_projects WHERE user_id = auth.uid()));
CREATE POLICY "Users can CRUD own timeline" ON ph_timeline FOR ALL USING (project_id IN (SELECT id FROM ph_projects WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ph_tasks_project ON ph_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_ph_tasks_status ON ph_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ph_notes_project ON ph_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_ph_timeline_project ON ph_timeline(project_id);
