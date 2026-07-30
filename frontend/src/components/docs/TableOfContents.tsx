import React from 'react';

export default function TableOfContents() {
  const links = [
    { id: 'coach-agent', label: 'Coach Agent', active: false },
    { id: 'builder-agents', label: 'Builder Agents', active: false },
    { id: 'auto-repair', label: 'Auto-repair', active: false },
    { id: 'pitch-eval', label: 'Pitch & Eval', active: false },
    { id: 'installation', label: 'Installation', active: false, strong: true },
    { id: 'interactive-chat-tui', label: 'Interactive Chat TUI', active: false, strong: true },
    { id: 'direct-prompt-build', label: 'Direct Prompt Build', active: false, strong: true },
    { id: 'web-gui-dashboard', label: 'Web GUI Dashboard', active: false, strong: true },
  ];

  return (
    <div className="space-y-2">
      <p className="font-semibold text-zinc-900 mb-4">On This Page</p>
      <ul className="m-0 list-none text-sm">
        {links.map((link, idx) => (
          <li key={idx} className="mt-0 pt-2">
            <a
              href={`#${link.id}`}
              className={`inline-block no-underline transition-colors ${
                link.active ? 'font-medium bg-black !text-white px-2 py-0.5 rounded-md hover:!text-white' : 'text-zinc-500 hover:text-zinc-900'
              } ${link.strong && !link.active ? 'font-semibold text-zinc-900 mt-2' : ''}`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-zinc-200 pt-8">
        <a href="#" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-2">
          Question? Give us feedback ↗
        </a>
        <a href="#" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          Edit this page
        </a>
      </div>
    </div>
  );
}
