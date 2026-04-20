import { Navbar } from "@/components/navbar";
import { Layers, CheckSquare, FileText, Clock, GitBranch, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Layers className="w-4 h-4" /> Built for AI Agent Workflows
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            All your AI projects. <span className="text-violet-600">One dashboard.</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
            Track tasks, decisions, notes, and timelines across all your agent-powered projects. Stop losing context between chat windows.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <a href="/auth/sign-in" className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg font-medium transition">
              Start Free
            </a>
            <a href="#features" className="border border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-3 rounded-lg font-medium transition">
              See Features
            </a>
          </div>
        </div>
      </section>

      <section className="py-8 border-y border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            For developers and teams running <span className="font-semibold text-slate-700">OpenClaw, Cursor, Claude Code, Copilot</span> and other AI agents
          </p>
        </div>
      </section>

      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to stay organized</h2>
            <p className="mt-4 text-slate-600">Each project gets its own space with full context tracking.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Layers, title: "Project Dashboard", desc: "See all projects at a glance — status, health, last activity, task counts." },
              { icon: CheckSquare, title: "Task Boards", desc: "Kanban-style task tracking per project. Todo, in-progress, done, blocked." },
              { icon: FileText, title: "Notes & Docs", desc: "Rich notes per project. Pin important ones. Categorize by type." },
              { icon: Clock, title: "Activity Timeline", desc: "Auto-logged timeline of everything that happened. Never lose context." },
              { icon: GitBranch, title: "Decision Log", desc: "Record key decisions with rationale. Know why choices were made months later." },
              { icon: MessageSquare, title: "Channel Integration", desc: "Link Slack channels to projects. See which conversations belong where." },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-lg transition-all bg-white">
                <f.icon className="w-10 h-10 text-violet-600 mb-4" />
                <h3 className="font-semibold text-lg text-slate-900">{f.title}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-violet-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold">Ready to get organized?</h2>
          <p className="mt-4 text-violet-100">Start managing your AI projects in one place.</p>
          <a href="/auth/sign-in" className="inline-block mt-8 bg-white text-violet-600 px-8 py-3 rounded-lg font-medium hover:bg-violet-50 transition">
            Get Started Free
          </a>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="text-sm text-slate-500">© 2026 ProjectHub by Eternal Academy</span>
        </div>
      </footer>
    </div>
  );
}
