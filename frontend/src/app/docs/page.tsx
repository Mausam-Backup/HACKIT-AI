import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  BrainCircuit, 
  Rocket, 
  ShieldCheck, 
  Presentation,
  Cpu,
  Layers,
  Keyboard,
  Settings,
  FolderTree,
  Play,
  AlertCircle,
  HelpCircle,
  Wrench
} from 'lucide-react';
import TableOfContents from '@/components/docs/TableOfContents';
import CodeBlock from '@/components/docs/CodeBlock';

export default function DocsPage() {
  const installCommands = {
    npx: 'npx hackit-ai',
    npm: 'npm install -g hackit-ai',
  };

  const tuiCommands = {
    bash: 'hackit',
  };

  const directCommands = {
    bash: 'hackit "create an AI-powered expense tracker for Indians"',
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
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
              HACKIT App Builder CLI
            </h1>
            <span className="bg-emerald-500/10 text-emerald-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
              v1.0 Ready
            </span>
          </div>
          <p className="text-lg text-zinc-600 mt-2">
            From idea → plan → full-stack code → validation → hackathon pitch in minutes.
          </p>
        </div>

        <div className="prose prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:font-medium prose-a:underline prose-a:underline-offset-4">
          
          {/* Section 1: Overview & Value Proposition */}
          <div id="overview" className="scroll-mt-24">
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>HACKIT</strong> is an autonomous, multi-agent AI system packaged into an interactive React/Ink Terminal User Interface (TUI). It acts as your AI Hackathon Coach and lead engineer, taking your raw project prompt and orchestrating a full pipeline of specialized agents to design, build, self-repair, and present a complete full-stack web application.
            </p>

            <div className="my-8 p-4 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl text-white shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Value Pitch</span>
              </div>
              <p className="m-0 text-zinc-200 text-sm leading-relaxed">
                Go from an unformed hackathon idea to a fully validated, working React + Express app with complete architecture documentation (<code className="text-emerald-300">PLAN.md</code>, <code className="text-emerald-300">ARCHITECTURE.md</code>) and a 3-minute pitch presentation deck (<code className="text-emerald-300">HACKATHON.md</code>) in minutes.
              </p>
            </div>
          </div>

          {/* Core Capabilities */}
          <div id="features" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mt-12 mb-6 text-zinc-900 border-b border-zinc-200 pb-2 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-zinc-900" />
              Core Value & Capabilities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-5 border border-zinc-200 rounded-xl bg-white shadow-sm hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 m-0 mb-1">🧠 Coach Agent</h3>
                <p className="text-sm text-zinc-600 m-0 leading-relaxed">
                  Analyzes your prompt, eliminates unnecessary scope, defines MVP features, and generates complete specs (<code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">PLAN.md</code>, <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">ARCHITECTURE.md</code>, <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">TASKS.md</code>).
                </p>
              </div>

              <div className="p-5 border border-zinc-200 rounded-xl bg-white shadow-sm hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
                  <Rocket className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 m-0 mb-1">⚡ Parallel Builder Agents</h3>
                <p className="text-sm text-zinc-600 m-0 leading-relaxed">
                  Generates full-stack web applications concurrently—constructing a modern React frontend and Express backend simultaneously.
                </p>
              </div>

              <div className="p-5 border border-zinc-200 rounded-xl bg-white shadow-sm hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 m-0 mb-1">🎨 Built-in Design System</h3>
                <p className="text-sm text-zinc-600 m-0 leading-relaxed">
                  Automatically enforces sleek modern aesthetics (dark mode, glassmorphism) and populates seed data into generated apps.
                </p>
              </div>

              <div className="p-5 border border-zinc-200 rounded-xl bg-white shadow-sm hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 m-0 mb-1">🔄 Automated Self-Repair</h3>
                <p className="text-sm text-zinc-600 m-0 leading-relaxed">
                  Executes build, lint, and test checks. If errors occur, it automatically analyzes stack traces and runs up to 2 repair iterations.
                </p>
              </div>

              <div className="p-5 border border-zinc-200 rounded-xl bg-white shadow-sm hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
                  <Presentation className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 m-0 mb-1">🎤 Pitch & Judge Scorer</h3>
                <p className="text-sm text-zinc-600 m-0 leading-relaxed">
                  Generates a 3-minute pitch deck outline (<code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">HACKATHON.md</code>) and evaluates your app against real hackathon rubrics (<code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">JUDGE_SCORE.md</code>).
                </p>
              </div>

              <div className="p-5 border border-zinc-200 rounded-xl bg-white shadow-sm hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 m-0 mb-1">💻 Interactive React/Ink TUI</h3>
                <p className="text-sm text-zinc-600 m-0 leading-relaxed">
                  Responsive terminal interface featuring real-time stage progress tracking, tech stack preset switcher, and scrollable logs.
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-700">
              <strong>Target Audience & Use Cases:</strong> Purpose-built for hackathon participants, solo founders, and developers who need to instantly pivot an idea into a fully working, validated full-stack MVP complete with pitch decks and documentation.
            </div>
          </div>

          {/* Section 2: Installation & Setup */}
          <div id="installation" className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-6 mt-16">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
                <CheckCircle2 className="w-4 h-4 text-zinc-900" />
              </div>
              <h2 className="text-2xl font-bold m-0 flex-1 border-b border-zinc-200 pb-2 text-zinc-900">
                Installation & Environment Setup
              </h2>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-zinc-900 mb-2 uppercase tracking-wider">Prerequisites</h4>
              <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1 m-0 mb-6">
                <li><strong>Node.js:</strong> <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900">≥ 18.0.0</code></li>
                <li><strong>Python:</strong> <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900">≥ 3.11</code> (lightweight runtime dependencies set up automatically on first run)</li>
              </ul>
            </div>

            <h4 className="text-sm font-semibold text-zinc-900 mb-2 uppercase tracking-wider">Installation Methods</h4>
            <CodeBlock commands={installCommands} />

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-zinc-900 mb-2 uppercase tracking-wider">Verification</h4>
              <p className="text-sm text-zinc-600 mb-2">Run the CLI directly to launch the TUI:</p>
              <CodeBlock commands={tuiCommands} />
            </div>
          </div>

          {/* Section 3: CLI Command Reference */}
          <div id="cli-reference" className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-6 mt-16">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
                <Terminal className="w-4 h-4 text-zinc-900" />
              </div>
              <h2 className="text-2xl font-bold m-0 flex-1 border-b border-zinc-200 pb-2 text-zinc-900">
                Complete CLI Command Reference
              </h2>
            </div>

            <div className="bg-zinc-900 text-white rounded-xl p-6 font-mono text-sm shadow-md my-6">
              <div className="text-zinc-400 text-xs mb-2">CLI COMMAND</div>
              <div className="text-emerald-400 font-bold text-lg mb-4">hackit [prompt]</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-xs">
                <div>
                  <span className="text-zinc-400 block mb-1">Aliases</span>
                  <span className="text-zinc-200">hackit-ai, app-builder-lite, hackathon-coach</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-1">Configuration</span>
                  <span className="text-zinc-200">Handled via config.yaml & TUI</span>
                </div>
              </div>
            </div>

            <p className="text-zinc-700 text-sm">
              If no prompt is provided, <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-zinc-900">hackit</code> launches the interactive TUI. Passing a prompt string immediately executes direct prompt build mode.
            </p>

            <h4 className="text-sm font-semibold text-zinc-900 mt-6 mb-2">Command Arguments</h4>
            <div className="overflow-x-auto my-4 border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-sm text-zinc-700 m-0">
                <thead className="bg-zinc-100 border-b border-zinc-200 text-xs text-zinc-900 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Argument</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Required</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  <tr>
                    <td className="p-3 font-mono font-semibold text-zinc-900">prompt</td>
                    <td className="p-3">String</td>
                    <td className="p-3 text-zinc-500">No</td>
                    <td className="p-3">The project idea prompt (e.g. "create an AI-powered expense tracker")</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-sm font-semibold text-zinc-900 mt-6 mb-2">Direct Build Example</h4>
            <CodeBlock commands={directCommands} />

            <div className="bg-zinc-950 text-zinc-100 p-4 rounded-xl font-mono text-xs my-4 shadow-inner">
              <div className="text-zinc-400 mb-2">// Sample Live Progress Terminal Output:</div>
              <div className="text-emerald-400 font-bold">⚡ HACKIT Agent Pipeline Progress  ⏱ 01:23</div>
              <div className="text-zinc-300">▶ 1. Coach Planning (PLAN, ARCHITECTURE, TASKS, PROMPTS)</div>
              <div className="text-zinc-500">○ 2. Code Generation (Vite+React Frontend & Express Backend)</div>
              <div className="text-zinc-500">○ 3. Validation & Repair (Build, Lint, Tests & Auto-repair)</div>
              <div className="text-zinc-500">○ 4. Pitch & Evaluation (HACKATHON update & JUDGE score)</div>
            </div>
          </div>

          {/* Section: TUI Controls & Shortcuts */}
          <div id="tui-shortcuts" className="scroll-mt-24">
            <h3 className="text-xl font-bold mt-10 mb-4 text-zinc-900 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-zinc-900" />
              TUI Keyboard Controls & Shortcuts
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                <span className="text-sm text-zinc-700">Cycle Tech Stack Presets</span>
                <kbd className="px-2 py-1 bg-white border border-zinc-300 rounded text-xs font-mono font-semibold text-zinc-900 shadow-xs">Tab</kbd>
              </div>
              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                <span className="text-sm text-zinc-700">Scroll Pipeline Logs</span>
                <kbd className="px-2 py-1 bg-white border border-zinc-300 rounded text-xs font-mono font-semibold text-zinc-900 shadow-xs">↑ / ↓</kbd>
              </div>
              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                <span className="text-sm text-zinc-700">Reset & Start New Project</span>
                <kbd className="px-2 py-1 bg-white border border-zinc-300 rounded text-xs font-mono font-semibold text-zinc-900 shadow-xs">/new</kbd>
              </div>
              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                <span className="text-sm text-zinc-700">Exit TUI Safely</span>
                <kbd className="px-2 py-1 bg-white border border-zinc-300 rounded text-xs font-mono font-semibold text-zinc-900 shadow-xs">Ctrl + C</kbd>
              </div>
            </div>
          </div>

          {/* Section 4: Configuration File & Schema Reference */}
          <div id="configuration" className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-6 mt-16">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
                <Settings className="w-4 h-4 text-zinc-900" />
              </div>
              <h2 className="text-2xl font-bold m-0 flex-1 border-b border-zinc-200 pb-2 text-zinc-900">
                Configuration File & Schema Reference
              </h2>
            </div>

            <p className="text-zinc-700 text-sm">
              HACKIT automatically loads configuration settings from <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-zinc-900">config.yaml</code> in your project root.
            </p>

            <div className="relative my-6 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-lg">
              <div className="bg-zinc-900 px-4 py-2 text-xs font-mono text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
                <span>config.yaml</span>
                <span className="text-emerald-400">YAML Schema</span>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto m-0 leading-relaxed">
{`# config.yaml
server_port: 4190              # [Integer] (Default: 4190) Client-server communication port (1024-65535).
http_timeout: 3600             # [Integer] (Default: 3600) Global HTTP timeout for agent requests in seconds.
strict_models: false           # [Boolean] (Default: false) Enforce strict model compatibility rules.
max_repair_attempts: 2         # [Integer] (Default: 2) Max auto-repair iterations on validation failure (Max 10).
coach_model: "default"         # [String]  (Default: "default") LLM model for Coach planning phase.
builder_model: "default"       # [String]  (Default: "default") LLM model for parallel Builder agents.
builder_timeout: 1800          # [Integer] (Default: 1800) Timeout in seconds for code generation tasks.
coach_timeout: 300             # [Integer] (Default: 300) Timeout in seconds for initial Coach plan.`}
              </pre>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700">
              <strong>Environment Variable:</strong> <code className="font-mono bg-zinc-100 px-1 rounded">RUNNING_IN_TUI</code> is set internally by the runner to adapt output logging for interactive TTY environments.
            </div>
          </div>

          {/* Section 5: Project Scaffolding */}
          <div id="directory-structure" className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-6 mt-16">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
                <FolderTree className="w-4 h-4 text-zinc-900" />
              </div>
              <h2 className="text-2xl font-bold m-0 flex-1 border-b border-zinc-200 pb-2 text-zinc-900">
                Project Scaffolding & Directory Architecture
              </h2>
            </div>

            <p className="text-zinc-700 text-sm">
              HACKIT generates a clean, modular full-stack repository structure with isolated frontend and backend environments:
            </p>

            <div className="my-6 rounded-xl border border-zinc-200 bg-zinc-900 text-zinc-100 p-4 font-mono text-xs overflow-x-auto shadow-sm">
{`my-project/
├── frontend/             # React 18 + Vite 5 frontend app
│   ├── package.json
│   └── src/
├── backend/              # Node.js + Express API server
│   ├── package.json
│   └── server.js
├── package.json          # Concurrent root runner ("npm run dev")
├── PLAN.md               # Executive summary, MVP scope, stretch goals
├── ARCHITECTURE.md       # Technical design, component map, DB schema
├── TASKS.md              # Checkbox task tracking list
├── WALKTHROUGH.md        # Directory map & manual verification steps
├── NEXT-STEPS.md         # Prompts for incremental feature expansion
├── HACKATHON.md          # 3-minute pitch outline & live demo script
├── JUDGE_SCORE.md        # AI judge scoring against hackathon rubrics
├── api-contract.json     # Centralized API schema contract
└── runs/                 # Logs and intermediate agent outputs`}
            </div>

            <h4 className="text-sm font-semibold text-zinc-900 mt-6 mb-3">Supported Tech Stacks & Presets</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 border border-zinc-200 rounded-lg bg-white">
                <strong className="text-zinc-900 block text-xs uppercase tracking-wide">Vite + React + Express</strong>
                <span className="text-xs text-zinc-600">Default / Recommended full-stack stack</span>
              </div>
              <div className="p-3 border border-zinc-200 rounded-lg bg-white">
                <strong className="text-zinc-900 block text-xs uppercase tracking-wide">Next.js + Supabase</strong>
                <span className="text-xs text-zinc-600">Next.js App Router with Tailwind CSS</span>
              </div>
              <div className="p-3 border border-zinc-200 rounded-lg bg-white">
                <strong className="text-zinc-900 block text-xs uppercase tracking-wide">Vanilla HTML + JS + CSS</strong>
                <span className="text-xs text-zinc-600">Lightweight zero-dependency web apps</span>
              </div>
              <div className="p-3 border border-zinc-200 rounded-lg bg-white">
                <strong className="text-zinc-900 block text-xs uppercase tracking-wide">Vue 3 + Node</strong>
                <span className="text-xs text-zinc-600">Vue 3 SFCs with Node.js API server</span>
              </div>
            </div>
          </div>

          {/* Section 6: Practical Workflows */}
          <div id="workflows" className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-6 mt-16">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
                <Play className="w-4 h-4 text-zinc-900" />
              </div>
              <h2 className="text-2xl font-bold m-0 flex-1 border-b border-zinc-200 pb-2 text-zinc-900">
                Step-by-Step Practical Workflows
              </h2>
            </div>

            <div className="space-y-6">
              <div className="p-5 border border-zinc-200 rounded-xl bg-white">
                <h3 className="text-base font-bold text-zinc-900 m-0 mb-2">Workflow 1: Starting a New App from Scratch</h3>
                <ol className="list-decimal pl-5 text-sm text-zinc-700 space-y-1 m-0">
                  <li>Run <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-900">hackit</code> in your terminal.</li>
                  <li>Press <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-xs font-mono">Tab</kbd> to choose your tech stack (e.g. Vite + React + Express).</li>
                  <li>Type your project prompt: <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">Create a realtime chat app with AI sentiment analysis</code>.</li>
                  <li>Press <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-xs font-mono">Enter</kbd> to launch the Coach & Builder pipeline.</li>
                </ol>
              </div>

              <div className="p-5 border border-zinc-200 rounded-xl bg-white">
                <h3 className="text-base font-bold text-zinc-900 m-0 mb-2">Workflow 2: Development & Hot Reloading</h3>
                <ol className="list-decimal pl-5 text-sm text-zinc-700 space-y-1 m-0">
                  <li>Navigate to your generated folder: <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-900">cd my-project</code></li>
                  <li>Run the root runner: <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-900">npm run dev</code></li>
                  <li>Both the Vite frontend and Express backend start concurrently in dev mode.</li>
                </ol>
              </div>

              <div className="p-5 border border-zinc-200 rounded-xl bg-white">
                <h3 className="text-base font-bold text-zinc-900 m-0 mb-2">Workflow 3: Production Build & Self-Repair Verification</h3>
                <p className="text-sm text-zinc-600 m-0">
                  HACKIT automatically validates builds during stage 3. To run production builds manually: <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-900">npm run build</code>. If errors occur during execution, HACKIT's auto-repair engine intercepts log traces and runs up to 2 repair passes automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Section 7: Troubleshooting & FAQ */}
          <div id="troubleshooting" className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-6 mt-16">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
                <AlertCircle className="w-4 h-4 text-zinc-900" />
              </div>
              <h2 className="text-2xl font-bold m-0 flex-1 border-b border-zinc-200 pb-2 text-zinc-900">
                Troubleshooting & FAQ
              </h2>
            </div>

            <div className="space-y-4 my-6">
              <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50">
                <h4 className="text-sm font-bold text-zinc-900 m-0 mb-1 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-zinc-700" />
                  Python interpreter not found! Please install Python ≥ 3.11
                </h4>
                <p className="text-xs text-zinc-600 m-0 leading-relaxed">
                  <strong>Fix:</strong> Ensure Python 3.11 or higher is installed and available in your system PATH as <code className="bg-zinc-200 px-1 rounded">python</code>, <code className="bg-zinc-200 px-1 rounded">python3</code>, or <code className="bg-zinc-200 px-1 rounded">py</code>.
                </p>
              </div>

              <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50">
                <h4 className="text-sm font-bold text-zinc-900 m-0 mb-1 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-zinc-700" />
                  Pipeline failed with exit code 1
                </h4>
                <p className="text-xs text-zinc-600 m-0 leading-relaxed">
                  <strong>Fix:</strong> Inspect <code className="bg-zinc-200 px-1 rounded">pipeline_debug.log</code> in your working directory. This usually happens if model responses fail parsing or if build repair attempts exceed <code className="bg-zinc-200 px-1 rounded">max_repair_attempts</code>.
                </p>
              </div>

              <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50">
                <h4 className="text-sm font-bold text-zinc-900 m-0 mb-1 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-zinc-700" />
                  Coach pass timed out after 300s
                </h4>
                <p className="text-xs text-zinc-600 m-0 leading-relaxed">
                  <strong>Fix:</strong> Increase the <code className="bg-zinc-200 px-1 rounded">coach_timeout</code> parameter inside your local <code className="bg-zinc-200 px-1 rounded">config.yaml</code> file.
                </p>
              </div>

              <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50">
                <h4 className="text-sm font-bold text-zinc-900 m-0 mb-1 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-zinc-700" />
                  Non-TTY / CI Terminal Support
                </h4>
                <p className="text-xs text-zinc-600 m-0 leading-relaxed">
                  The React/Ink TUI requires a standard interactive terminal (TTY). If executed in automated CI/CD pipelines, HACKIT gracefully falls back to structured plain-text logging.
                </p>
              </div>
            </div>

          </div>
          
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
