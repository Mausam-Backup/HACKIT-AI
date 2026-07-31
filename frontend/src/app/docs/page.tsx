import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, Terminal, LayoutDashboard, Copy, CheckCircle2, BrainCircuit, Rocket, ShieldCheck, Presentation } from 'lucide-react';
import TableOfContents from '@/components/docs/TableOfContents';
import CodeBlock from '@/components/docs/CodeBlock';

export default function DocsPage() {
  const installCommands = {
    npm: 'npm install -g hackit-cli',
    yarn: 'yarn global add hackit-cli',
    pnpm: 'pnpm add -g hackit-cli',
    bun: 'bun add -g hackit-cli',
  };

  const tuiCommands = {
    bash: 'hackit',
  };

  const directCommands = {
    bash: 'hackit "expense tracker app"',
  };

  const guiCommands = {
    bash: 'hackit gui',
  };

  return (
    <>
      {/* Main Content Area */}
      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-1 text-sm text-zinc-500 mb-2">
            <Link href="/docs" className="hover:text-zinc-900 transition-colors">Documentation</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-900 font-medium">App Builder CLI</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            App Builder CLI
          </h1>
          <p className="text-lg text-zinc-600 mt-2">
            The autonomous HACKIT CLI that takes you from idea to a working demo in minutes.
          </p>
        </div>

        <div className="prose prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:font-medium prose-a:underline prose-a:underline-offset-4">
          
          <p className="text-zinc-700 leading-relaxed text-lg">
            HACKIT isn't just another scaffolding tool—it's an advanced, AI-powered autonomous agent system engineered to accelerate your hackathon workflow. From a single prompt, HACKIT orchestrates a team of specialized agents to generate full project architecture, scaffold modern frontend (Vite+React) and backend (Express) applications, validate your build pipeline, and synthesize a winning pitch deck.
          </p>

          <div className="my-10 rounded-xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-50">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-auto object-cover block"
            >
              <source src="/hac-kit cli demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6 text-zinc-900 border-b border-zinc-200 pb-2">How It Works: The 4-Stage Engine</h2>
          <p className="text-zinc-700 mb-8">
            The CLI delegates your prompt to a cascading pipeline of agents. Each agent specializes in a specific phase of the product development lifecycle, ensuring enterprise-grade architecture and robust execution.
          </p>

          <div className="relative border-l-2 border-zinc-900 ml-6 my-12 flex flex-col gap-12 py-2">
            {/* Coach Agent */}
            <div className="relative pl-10">
              <div className="absolute -left-[21px] top-0 w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-[0_0_0_6px_white] transition-transform hover:scale-110">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 id="coach-agent" className="font-bold text-xl text-zinc-900 m-0 mb-2 mt-1 leading-none">1. Coach Agent (The Architect)</h3>
              <p className="text-zinc-600 m-0 leading-relaxed">
                The Coach Agent acts as your technical co-founder. It deeply analyzes your initial idea, extracts core features, defines a highly focused MVP (Minimum Viable Product), and generates comprehensive documentation including <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded-md text-zinc-900 font-mono">PLAN.md</code>, <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded-md text-zinc-900 font-mono">ARCHITECTURE.md</code>, and a detailed <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded-md text-zinc-900 font-mono">TASKS.md</code> queue for the builders.
              </p>
            </div>

            {/* Builder Agents */}
            <div className="relative pl-10">
              <div className="absolute -left-[21px] top-0 w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-[0_0_0_6px_white] transition-transform hover:scale-110">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 id="builder-agents" className="font-bold text-xl text-zinc-900 m-0 mb-2 mt-1 leading-none">2. Builder Agents (The Engineers)</h3>
              <p className="text-zinc-600 m-0 leading-relaxed">
                Once the architecture is mapped out, HACKIT deploys asynchronous Builder Agents. The Frontend Agent scaffolds a beautiful, responsive Vite + React + Tailwind CSS application, while the Backend Agent simultaneously constructs a secure, RESTful Express server. They work in parallel, slashing your development time.
              </p>
            </div>

            {/* Auto-repair */}
            <div className="relative pl-10">
              <div className="absolute -left-[21px] top-0 w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-[0_0_0_6px_white] transition-transform hover:scale-110">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 id="auto-repair" className="font-bold text-xl text-zinc-900 m-0 mb-2 mt-1 leading-none">3. Auto-Repair (The QA Team)</h3>
              <p className="text-zinc-600 m-0 leading-relaxed">
                Code generation isn't perfect, so HACKIT tests it. The Auto-Repair loop automatically runs <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded-md text-zinc-900 font-mono">npm run build</code> and linting checks. If it detects a compilation error, it feeds the stack trace back to the LLM for autonomous debugging, iterating up to 2 times to guarantee you receive a functional, working codebase.
              </p>
            </div>

            {/* Pitch & Eval */}
            <div className="relative pl-10">
              <div className="absolute -left-[21px] top-0 w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-[0_0_0_6px_white] transition-transform hover:scale-110">
                <Presentation className="w-5 h-5" />
              </div>
              <h3 id="pitch-eval" className="font-bold text-xl text-zinc-900 m-0 mb-2 mt-1 leading-none">4. Pitch & Eval (The Judges)</h3>
              <p className="text-zinc-600 m-0 leading-relaxed">
                Hackathons are won on the presentation. The final agent synthesizes your entire technical architecture into a highly persuasive <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded-md text-zinc-900 font-mono">HACKATHON.md</code> pitch guide. It also evaluates your project against standard hackathon criteria, providing a <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded-md text-zinc-900 font-mono">JUDGE_SCORE.md</code> to help you refine your demo.
              </p>
            </div>
          </div>

          {/* Installation */}
          <div className="flex items-center gap-4 mb-6 mt-16">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
              <CheckCircle2 className="w-4 h-4 text-zinc-900" />
            </div>
            <h2 id="installation" className="text-xl font-semibold m-0 flex-1 border-b border-zinc-200 pb-2">Installation</h2>
          </div>
          
          <p className="text-zinc-700">
            Install the HACKIT CLI globally to access the powerful <code className="bg-zinc-100 px-1.5 py-0.5 rounded-md text-sm font-mono text-zinc-900">hackit</code> command from anywhere on your machine. Ensure you have Node.js 18+ installed.
          </p>

          <CodeBlock commands={installCommands} />

          {/* Interactive Chat TUI */}
          <div className="flex items-center gap-4 mb-6 mt-16">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
              <Terminal className="w-4 h-4 text-zinc-900" />
            </div>
            <h2 id="interactive-chat-tui" className="text-xl font-semibold m-0 flex-1 border-b border-zinc-200 pb-2">Interactive Chat TUI</h2>
          </div>

          <p className="text-zinc-700">
            Launch the interactive Terminal User Interface (TUI) to chat directly with the HACKIT Coach Agent. This interface allows you to organically brainstorm, refine your idea, and iterate on the architecture before triggering the heavy-lifting builder agents.
          </p>

          <CodeBlock commands={tuiCommands} />

          {/* Direct Build */}
          <div className="flex items-center gap-4 mb-6 mt-16">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 text-zinc-900" />
            </div>
            <h2 id="direct-prompt-build" className="text-xl font-semibold m-0 flex-1 border-b border-zinc-200 pb-2">Direct Prompt Build</h2>
          </div>

          <p className="text-zinc-700">
            Already know exactly what you want to build? Bypass the conversational phase by passing your prompt directly to the CLI. HACKIT will immediately begin scaffolding the entire full-stack application.
          </p>

          <CodeBlock commands={directCommands} />

          {/* Web GUI Dashboard */}
          <div className="flex items-center gap-4 mb-6 mt-16">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
              <LayoutDashboard className="w-4 h-4 text-zinc-900" />
            </div>
            <h2 id="web-gui-dashboard" className="text-xl font-semibold m-0 flex-1 border-b border-zinc-200 pb-2">Web GUI Dashboard</h2>
          </div>

          <p className="text-zinc-700">
            If you prefer a rich visual interface over the terminal, launch the HACKIT Web GUI server. This spins up a beautiful local FastAPI dashboard where you can manage projects, view agent logs in real-time, and download your pitch decks. Accessible instantly at <code className="bg-zinc-100 px-1.5 py-0.5 rounded-md text-sm font-mono text-zinc-900 text-sky-600 font-semibold">http://127.0.0.1:4097</code>.
          </p>

          <CodeBlock commands={guiCommands} />
          
        </div>
      </div>

      <div className="hidden text-sm xl:block">
        <div className="sticky top-24 -mt-10 h-[calc(100vh-3.5rem)] overflow-y-auto pt-10 pb-16">
          <TableOfContents />
        </div>
      </div>
    </>
  );
}
