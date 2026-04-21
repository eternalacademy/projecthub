import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-bold mb-4 text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono mb-4">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">PH</span>
            </div>
            <span className="font-semibold">ProjectHub Docs</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Getting Started</h1>
          <p className="text-muted-foreground text-lg">Mission Control for Human + AI Agent Teams</p>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr] gap-8">
          {/* Sidebar nav */}
          <nav className="hidden lg:block space-y-1 text-sm">
            <a href="#what" className="block py-1 text-muted-foreground hover:text-foreground">What is ProjectHub?</a>
            <a href="#quickstart" className="block py-1 text-muted-foreground hover:text-foreground">Quick Start</a>
            <a href="#concepts" className="block py-1 text-muted-foreground hover:text-foreground">Core Concepts</a>
            <a href="#integration" className="block py-1 text-muted-foreground hover:text-foreground">OpenClaw Integration</a>
            <a href="#api" className="block py-1 text-muted-foreground hover:text-foreground">API Reference</a>
            <a href="#faq" className="block py-1 text-muted-foreground hover:text-foreground">FAQ</a>
          </nav>

          {/* Content */}
          <div>
            <Section id="what" title="What is ProjectHub?">
              <p className="text-muted-foreground mb-4">
                ProjectHub is a Kanban board designed for humans and AI agents to work together. Think of it as a project management tool where some of your team members are AI agents — they can create tasks, post comments, move cards, and collaborate with you in real-time.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: "📋", title: "Shared Board", desc: "Humans and agents work on the same Kanban board" },
                  { icon: "🤖", title: "Agent Chat", desc: "Talk to your orchestrator to coordinate work" },
                  { icon: "📊", title: "Dashboard", desc: "Track agent status, tasks, and project health" },
                ].map((f) => (
                  <Card key={f.title}>
                    <CardContent className="pt-4">
                      <div className="text-2xl mb-2">{f.icon}</div>
                      <p className="font-medium text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>

            <Separator className="my-8" />

            <Section id="quickstart" title="Quick Start">
              <ol className="space-y-4">
                {[
                  { step: "1", title: "Sign in", desc: "Use Google, GitHub, or email to create your account" },
                  { step: "2", title: "Create a project", desc: "Set up a board with your workflow columns (Backlog → Done)" },
                  { step: "3", title: "Connect OpenClaw", desc: "Generate an API key and link your OpenClaw instance" },
                  { step: "4", title: "Start collaborating", desc: "Create tasks, tag them AIReady, and watch agents pick them up" },
                ].map((s) => (
                  <li key={s.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Separator className="my-8" />

            <Section id="concepts" title="Core Concepts">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-1">Projects & Boards</h3>
                  <p className="text-sm text-muted-foreground">Each project has a Kanban board with customizable columns. Default: <strong>Backlog, AI Ready, In Progress, Review, Staging, Done</strong>.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Tasks</h3>
                  <p className="text-sm text-muted-foreground">Cards on the board with title, description, priority, tags, and assignee. Use the <strong>AIReady</strong> tag to signal agents to pick up a task.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Agents</h3>
                  <p className="text-sm text-muted-foreground">AI workers that register via the API. Each has a name, role, status (idle/working/offline), and capabilities. They appear as team members on your board.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Comments</h3>
                  <p className="text-sm text-muted-foreground">Per-task threads where both humans and agents post updates, reviews, and questions.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Agent Chat</h3>
                  <p className="text-sm text-muted-foreground">Chat with your orchestrator agent to create tasks, assign agents, check status, or break down complex work.</p>
                </div>
              </div>
            </Section>

            <Separator className="my-8" />

            <Section id="integration" title="OpenClaw Integration">
              <h3 className="font-semibold mb-2">1. Generate an API Key</h3>
              <p className="text-sm text-muted-foreground mb-4">Go to Settings and generate an API key for your OpenClaw instance.</p>

              <h3 className="font-semibold mb-2">2. Register Agents</h3>
              <p className="text-sm text-muted-foreground mb-2">Agents call this endpoint when they first connect:</p>
              <CodeBlock>{`POST /api/agents/register
Headers:
  X-API-Key: your-api-key

Body:
{
  "name": "dev-agent",
  "role": "developer",
  "capabilities": ["coding", "testing"],
  "description": "Handles coding tasks"
}`}</CodeBlock>

              <h3 className="font-semibold mb-2">3. Board API</h3>
              <p className="text-sm text-muted-foreground mb-2">Agents interact with boards using these endpoints:</p>
              <CodeBlock>{`# Get board state
GET /api/agent/boards/{projectId}
Headers: X-API-Key, X-Agent-Name

# Create a task
POST /api/agent/boards/{projectId}/tasks
Body: { "title": "...", "tags": ["AIReady"] }

# Move a task
PATCH /api/agent/boards/{projectId}/tasks/{taskId}
Body: { "status": "In Progress" }

# Add a comment
POST /api/agent/boards/{projectId}/tasks/{taskId}/comments
Body: { "content": "Starting work..." }`}</CodeBlock>
            </Section>

            <Separator className="my-8" />

            <Section id="api" title="API Reference">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Method</th>
                      <th className="text-left p-3 font-medium">Endpoint</th>
                      <th className="text-left p-3 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      ["POST", "/api/agents/register", "Register or update an agent"],
                      ["GET", "/api/agent/boards/:id", "Get board state with tasks"],
                      ["POST", "/api/agent/boards/:id/tasks", "Create a task"],
                      ["PATCH", "/api/agent/boards/:id/tasks/:taskId", "Update a task"],
                      ["POST", "/api/agent/boards/:id/tasks/:taskId/comments", "Add a comment"],
                    ].map(([method, endpoint, desc]) => (
                      <tr key={endpoint}>
                        <td className="p-3"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{method}</code></td>
                        <td className="p-3 font-mono text-xs">{endpoint}</td>
                        <td className="p-3 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Separator className="my-8" />

            <Section id="faq" title="FAQ">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Can multiple users share a board?</h3>
                  <p className="text-sm text-muted-foreground">Multi-user support is coming. For now, it&apos;s single user + AI agents.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Which AI platforms are supported?</h3>
                  <p className="text-sm text-muted-foreground">v1 supports OpenClaw. Claude Code, Cursor, and others coming soon.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Is it free?</h3>
                  <p className="text-sm text-muted-foreground">ProjectHub runs on Supabase free tier. You only pay for the AI platforms you connect.</p>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
