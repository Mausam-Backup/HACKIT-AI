import React from 'react';

export default function TableOfContents() {
  const links = [
    { id: 'cli-quickstart', label: 'CLI Quickstart', active: true },
    { id: 'initialize-cli', label: 'Initialize CLI', active: false },
    { id: 'options-for-init', label: 'Options for init', active: false },
    { id: 'add-components', label: 'Add Components', active: false },
    { id: 'options-for-add', label: 'Options for add', active: false },
    { id: 'use-in-monorepo', label: 'Use in Monorepo', active: false },
    { id: 'installation-through-cli', label: 'Installation through CLI', active: false },
    { id: 'shadcn-cli', label: 'Shadcn CLI 3.0', active: false, strong: true },
    { id: 'github-registry', label: 'GitHub Registry Installation', active: false, strong: true },
    { id: 'search-discovery', label: 'Search and Discovery', active: false },
    { id: 'view', label: 'View', active: false },
    { id: 'search', label: 'Search', active: false },
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
