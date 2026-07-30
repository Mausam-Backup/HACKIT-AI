import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, Copy, FileText } from 'lucide-react';
import TableOfContents from '@/components/docs/TableOfContents';
import CodeBlock from '@/components/docs/CodeBlock';

export default function DocsPage() {
  const initCommands = {
    npm: 'npx hackit-ai@latest init',
    pnpm: 'pnpm dlx hackit-ai@latest init',
    yarn: 'yarn dlx hackit-ai@latest init',
    bun: 'bunx hackit-ai@latest init',
  };

  const addCommands = {
    npm: 'npx hackit-ai@latest add button',
    pnpm: 'pnpm dlx hackit-ai@latest add button',
    yarn: 'yarn dlx hackit-ai@latest add button',
    bun: 'bunx hackit-ai@latest add button',
  };

  return (
    <>
      {/* Main Content Area */}
      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-1 text-sm text-zinc-500 mb-2">
            <Link href="/docs" className="hover:text-zinc-900 transition-colors">Installation</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-900 font-medium">CLI</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            CLI Quickstart
          </h1>
          <p className="text-lg text-zinc-600 mt-2">
            Command Line Interface (CLI) to manage and configure your project efficiently.
          </p>
        </div>

        <div className="prose prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:font-medium prose-a:underline prose-a:underline-offset-4">
          {/* Step 1 */}
          <div className="flex items-center gap-4 mb-6 mt-10">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 text-zinc-900" />
            </div>
            <h2 className="text-xl font-semibold m-0 flex-1 border-b border-zinc-200 pb-2">Initialize CLI</h2>
          </div>
          
          <p className="text-zinc-700">
            Use the <code className="bg-zinc-100 px-1.5 py-0.5 rounded-md text-sm font-mono text-zinc-900">init</code> command to initialize configuration and dependencies for a new project.
          </p>

          <CodeBlock commands={initCommands} />

          <p className="text-zinc-700">
            This installs dependencies, sets up the <code className="bg-zinc-100 px-1.5 py-0.5 rounded-md text-sm font-mono text-zinc-900">cn</code> utility, configures <code className="bg-zinc-100 px-1.5 py-0.5 rounded-md text-sm font-mono text-zinc-900 font-bold bg-black text-white ml-1">tailwind.config.ts</code>, and generates a <code className="bg-zinc-100 px-1.5 py-0.5 rounded-md text-sm font-mono text-zinc-900 bg-zinc-200 ml-1">&#123;&middot;&#125; components.json</code> file.
          </p>

          <p className="text-zinc-700 mt-6">
            You will be asked a few questions to configure <code className="bg-zinc-100 px-1.5 py-0.5 rounded-md text-sm font-mono text-zinc-900 bg-zinc-200">&#123;&middot;&#125; components.json</code>:
          </p>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 overflow-hidden my-6 relative">
            <div className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 cursor-pointer transition-colors">
              <Copy className="w-4 h-4" />
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-zinc-800 leading-relaxed">
                <span className="text-zinc-500">Which style would you like to use? ›</span> <span className="text-sky-600">New York</span><br/>
                <span className="text-zinc-500">Which color would you like to use as base color? ›</span> <span className="text-sky-600">Zinc</span><br/>
                <span className="text-zinc-500">Do you want to use CSS variables for colors? ›</span> <span className="text-zinc-900">no / yes</span>
              </pre>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-4 mb-6 mt-16">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm shrink-0">
              <FileText className="w-4 h-4 text-zinc-900" />
            </div>
            <h2 className="text-xl font-semibold m-0 flex-1 border-b border-zinc-200 pb-2">Add Components</h2>
          </div>

          <p className="text-zinc-700">
            Use the <code className="bg-zinc-100 px-1.5 py-0.5 rounded-md text-sm font-mono text-zinc-900">add</code> command to add components to your project.
          </p>

          <CodeBlock commands={addCommands} />
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
