'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarItem = {
  label: string;
  href: string;
  badge?: string;
  badgeStyle?: string;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export default function DocsSidebar() {
  const [activeHref, setActiveHref] = useState<string>('/docs');
  const pathname = usePathname();

  useEffect(() => {
    // Basic sync with initial hash on mount
    if (typeof window !== 'undefined' && window.location.hash) {
      setActiveHref(window.location.hash);
    } else {
      setActiveHref(pathname || '/docs');
    }
  }, [pathname]);

  const sections: SidebarSection[] = [
    {
      title: 'Getting Started',
      items: [
        { label: 'Overview & Pitch', href: '#overview' },
        { label: 'Core Capabilities', href: '#features' },
        { label: 'Installation', href: '#installation' },
      ],
    },
    {
      title: 'CLI & TUI Reference',
      items: [
        { label: 'Command Reference', href: '#cli-reference', badge: 'CLI', badgeStyle: 'bg-zinc-900 text-white rounded-md px-1.5 py-0.5' },
        { label: 'TUI Controls', href: '#tui-shortcuts' },
        { label: 'Configuration Schema', href: '#configuration' },
      ],
    },
    {
      title: 'Architecture & Guides',
      items: [
        { label: 'Project Scaffolding', href: '#directory-structure' },
        { label: 'Practical Workflows', href: '#workflows' },
        { label: 'Troubleshooting & FAQ', href: '#troubleshooting' },
      ],
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-sm">
      {sections.map((section, idx) => (
        <div key={idx} className="flex flex-col gap-2">
          <h4 className="font-semibold text-zinc-900 flex items-center gap-2">
            {section.title}
          </h4>
          <div className="flex flex-col gap-1 mt-1 border-l border-zinc-100 ml-1 pl-3">
            {section.items.map((item, itemIdx) => {
              const isActive = activeHref === item.href;
              
              return (
                <Link
                  key={itemIdx}
                  href={item.href}
                  onClick={() => setActiveHref(item.href)}
                  className={`flex items-center justify-between py-1.5 transition-colors ${
                    isActive ? 'text-zinc-900 font-medium' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {isActive ? (
                    <div className="flex items-center w-full bg-zinc-900 text-white px-3 py-1.5 rounded-md shadow-sm">
                      {item.label}
                    </div>
                  ) : (
                    <span className="px-3 py-1">{item.label}</span>
                  )}
                  
                  {item.badge && !isActive && (
                    <span className={`text-[10px] font-semibold leading-none ${item.badgeStyle || 'bg-zinc-100 text-zinc-500 rounded-full px-2 py-0.5'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
