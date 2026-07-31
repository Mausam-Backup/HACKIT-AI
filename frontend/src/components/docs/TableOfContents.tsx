import React from 'react';

export default function TableOfContents() {
  const links = [
    { id: 'overview', label: 'Overview & Value Pitch', strong: true },
    { id: 'features', label: 'Core Capabilities' },
    { id: 'installation', label: 'Installation & Setup', strong: true },
    { id: 'cli-reference', label: 'CLI Reference', strong: true },
    { id: 'tui-shortcuts', label: 'TUI Controls & Shortcuts' },
    { id: 'configuration', label: 'Configuration Schema', strong: true },
    { id: 'directory-structure', label: 'Project Scaffolding', strong: true },
    { id: 'workflows', label: 'Practical Workflows', strong: true },
    { id: 'troubleshooting', label: 'Troubleshooting & FAQ', strong: true },
  ];

  return (
    <div className="space-y-2">
      <p className="font-semibold text-zinc-900 mb-4">On This Page</p>
      <ul className="m-0 list-none text-sm">
        {links.map((link, idx) => (
          <li key={idx} className="mt-0 pt-2">
            <a
              href={`#${link.id}`}
              className={`inline-block no-underline transition-colors text-zinc-500 hover:text-zinc-900 ${
                link.strong ? 'font-semibold text-zinc-900 mt-2' : ''
              }`}
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

