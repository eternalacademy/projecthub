# ProjectHub — Mission Control for Human + AI Agent Teams

## Vision
A Kanban board where humans and AI agents collaborate as teammates. Think of it as a project management tool designed for teams where some members are AI agents.

## Core Concepts

### Entities
- **User** — Single user (v1), owns everything
- **Platform** — Connected AI platform (OpenClaw v1, extensible later)
- **Agent** — AI worker registered from a platform (e.g., "dev-agent", "review-agent", "ops-agent")
- **Project** — A workspace containing a board, docs, and team
- **Board** — Kanban board with configurable columns
- **Task** — A card on the board, assignable to human or agent
- **Comment** — Thread on a task for discussion between humans and agents
- **Tag** — Labels on tasks (e.g., AIReady, Bug, Feature, DevOps)

### Agent Roles (examples)
- **Orchestrator** — Main agent user chats with, coordinates other agents
- **Dev Agent** — Picks coding tasks, creates PRs
- **Review Agent** — Reviews code, adds comments, approves/rejects
- **Ops Agent** — Deploys approved changes
- **Tester Agent** — Creates bugs, verifies fixes

## Features (v1)

### 1. Dashboard
- Overview: active projects, tasks by status, recent activity
- Agent status panel: which agents are idle/working/offline
- Metrics: tasks completed, tokens used (from logs), agent utilization
- Per-project and overall views

### 2. Projects & Boards
- Create/manage projects
- Each project has a Kanban board with default columns: Backlog, AI Ready, In Progress, Review, Staging, Done
- Columns are customizable
- Board supports drag-and-drop (v2) or button-based move (v1)

### 3. Tasks
- Create/edit/delete tasks with title, description, priority, tags
- Assign to self or any agent
- Move between columns (status changes)
- Tag with AIReady → orchestrator picks up and assigns to specialized agent
- Subtask support (v2)

### 4. Comments
- Per-task thread
- Both humans and agents can post
- Support for status updates, review comments, questions
- Agent comments show agent name + platform badge

### 5. Agent Chat (Orchestrator)
- Chat interface with the main orchestrator agent
- User can: create tasks, assign agents, ask status, orchestrate work
- Agent can: create tasks, assign sub-agents, report progress
- Chat messages that create/modify tasks reflect on the board in real-time

### 6. Agent Management
- Agents auto-register via API when they first connect
- Status tracking: idle, working, offline
- Activity log per agent

### 7. Platform Integration (OpenClaw v1)
- Connect via API key (one per OpenClaw instance)
- ProjectHub exposes REST API for agents
- OpenClaw skill for agent interaction with boards
- Agent identity passed via agent name in request headers

### 8. Theme & UX
- Dark/light theme toggle
- Responsive (mobile-friendly)
- Clean, modern UI (violet accent kept)
- Real-time board updates (SSE or polling)
- Toast notifications for activity

## Database Schema (ph_ prefix)

### ph_projects
- id, name, description, color, icon, status, columns_config (JSONB), created_by, created_at, updated_at

### ph_agents
- id, name, role, platform, status, capabilities (JSONB), last_active_at, created_at

### ph_tasks
- id, project_id, title, description, status (column name), priority, tags (TEXT[]), assigned_to (agent_id or 'user'), assignee_type ('agent'|'user'), created_by, created_by_type, position, created_at, updated_at

### ph_comments
- id, task_id, author_id, author_type ('agent'|'user'), content, created_at, updated_at

### ph_activity_log
- id, project_id, task_id, agent_id, action, details (JSONB), created_at

### ph_platform_connections
- id, platform_type, api_key_hash, config (JSONB), status, created_at

### ph_chat_messages
- id, sender_type ('user'|'agent'), sender_id, content, metadata (JSONB), created_at

### ph_agent_metrics
- id, agent_id, date, tasks_completed, tokens_used, errors, metadata (JSONB)

## API Endpoints (for OpenClaw integration)

### Board API
- GET /api/boards/:projectId — Get board state
- POST /api/boards/:projectId/tasks — Create task
- PATCH /api/boards/:projectId/tasks/:taskId — Update task
- DELETE /api/boards/:projectId/tasks/:taskId — Delete task
- POST /api/boards/:projectId/tasks/:taskId/move — Move task to column
- POST /api/boards/:projectId/tasks/:taskId/assign — Assign to agent/user
- GET /api/boards/:projectId/tasks/:taskId/comments — Get comments
- POST /api/boards/:projectId/tasks/:taskId/comments — Add comment

### Agent API
- POST /api/agents/register — Register an agent
- GET /api/agents — List agents and status
- PATCH /api/agents/:agentId/status — Update agent status

### Chat API
- GET /api/chat/messages — Get chat history
- POST /api/chat/messages — Send message (triggers orchestrator)

### Auth
- API key in header: `X-API-Key: <key>`
- Agent name in header: `X-Agent-Name: <name>`

## Tech Stack
- Next.js 16 (App Router)
- Supabase (PostgreSQL, Auth)
- shadcn/ui + Tailwind
- Server-Sent Events for real-time board updates
- Vitest for testing

## Implementation Phases

### Phase 1 (Current) — Core Platform
1. Fresh project setup (keep Supabase env vars)
2. Database schema + migrations
3. Auth (GitHub OAuth via Supabase)
4. Dashboard with agent status + metrics
5. Projects CRUD
6. Kanban board with tasks
7. Comments on tasks
8. Dark/light theme
9. API endpoints for agent interaction
10. Agent registration + status
11. Documentation

### Phase 2 — Intelligence
1. Chat with orchestrator agent
2. AIReady tag auto-assignment
3. Real-time updates (SSE)
4. Agent metrics from logs

### Phase 3 — Collaboration
1. Multi-user support
2. Drag-and-drop board
3. Multi-platform (Claude Code, Cursor)
4. Subtasks
5. File attachments

## Open Questions (Resolved)
- ~~Integration mechanism~~ → REST API + API keys
- ~~Agent identity~~ → One API key per OpenClaw, agent name in header + auto-register
- ~~Token tracking~~ → From logs, not real-time
- ~~Real-time~~ → SSE for board, not critical for v1
- ~~Users~~ → Single user + agents for v1
- ~~Codebase~~ → Fresh start, keep Supabase config
