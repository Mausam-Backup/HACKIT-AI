import React from 'react';
import Link from 'next/link';
import { Moon, Sun, Hexagon } from 'lucide-react';
import DocsSidebar from '@/components/docs/DocsSidebar';
import FloatingNav from '@/components/ui/FloatingNav';
import Footer from '@/components/landing/Footer';
import TableOfContents from '@/components/docs/TableOfContents';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.3-.4-4 1.5a13.3 13.3 0 0 0-7 0C6.2 2.1 4.9 2.1 4.9 2.1a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 12.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
    <path d="M9 18c-4.5 1.5-5-2.5-7-3" />
  </svg>
);

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-zinc-200">
      <FloatingNav />
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md pt-16">
        <div className="container mx-auto max-w-[1536px] flex h-16 items-center px-4 md:px-8">
          <div className="flex items-center gap-6 md:gap-8 mr-4">
            <Link href="/" className="flex items-center gap-2">
              <Hexagon className="h-6 w-6 text-zinc-900 fill-zinc-900" />
              <span className="font-bold text-lg tracking-tight">HAC-KIT AI</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-zinc-100 transition-colors">
                <GithubIcon className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <button className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-zinc-100 transition-colors">
                <Sun className="h-5 w-5" />
                <span className="sr-only">Toggle theme</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main 3-column Layout */}
      <div className="container mx-auto max-w-[1536px] flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] px-4 md:px-8">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r border-zinc-200 py-6 pr-6 md:sticky md:block">
          <DocsSidebar />
        </aside>
        <main className="relative py-6 lg:gap-10 lg:py-10 xl:grid xl:grid-cols-[1fr_260px]">
          <div className="mx-auto w-full min-w-0 max-w-3xl">
            {children}
          </div>
          <div className="hidden text-sm xl:block">
            <div className="sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] overflow-y-auto pt-10 pb-16">
              <TableOfContents />
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
