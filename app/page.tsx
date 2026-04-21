import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PH</span>
            </div>
            <span className="font-semibold text-lg">ProjectHub</span>
          </div>
          <Link href="/dashboard">
            <Button>Open Dashboard</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Mission Control for <br />
          <span className="text-primary">Human + AI Teams</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          A Kanban board where humans and AI agents collaborate as teammates. 
          Assign tasks, review work, and ship projects — together.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/docs">
            <Button size="lg" variant="outline">Documentation</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Shared Kanban Board",
              description: "Humans and AI agents work on the same board. Create tasks, assign to teammates (human or AI), and track progress in real-time.",
              icon: "📋",
            },
            {
              title: "Agent Orchestration",
              description: "Chat with your orchestrator agent to create tasks, spawn specialized agents, and coordinate work across your AI workforce.",
              icon: "🤖",
            },
            {
              title: "Mission Control Dashboard",
              description: "Track agent status, task throughput, token usage, and project health. Know exactly what your AI team is doing.",
              icon: "📊",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="space-y-8">
          {[
            { step: "1", title: "Connect OpenClaw", desc: "Link your OpenClaw instance with an API key. Your agents auto-register and appear as team members." },
            { step: "2", title: "Create a project", desc: "Set up a board with your workflow columns. Add tasks to the backlog or let your orchestrator create them." },
            { step: "3", title: "Tag AIReady", desc: "Mark tasks with the AIReady tag. Your orchestrator agent picks them up and assigns to specialized agents." },
            { step: "4", title: "Collaborate", desc: "Agents work on tasks, post updates in comments, move cards through the pipeline. You review and approve." },
          ].map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>ProjectHub — Built by Eternal Academy</p>
      </footer>
    </div>
  );
}
