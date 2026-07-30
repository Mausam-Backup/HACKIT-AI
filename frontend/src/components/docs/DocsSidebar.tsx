import React from 'react';
import Link from 'next/link';

export default function DocsSidebar() {
  type SidebarItem = {
    label: string;
    href: string;
    active: boolean;
    badge?: string;
    badgeStyle?: string;
  };

  type SidebarSection = {
    title: string;
    items: SidebarItem[];
  };

  const sections: SidebarSection[] = [
    {
      title: 'Sections',
      items: [
        { label: 'Get Started', href: '#', active: false },
        { label: 'Components', href: '#', active: false },
        { label: 'Changelog', href: '#', active: false, badge: 'new' },
      ],
    },
    {
      title: 'Getting Started',
      items: [
        { label: 'Installation', href: '/docs', active: true },
        { label: 'llms.txt', href: '#', active: false },
      ],
    },
    {
      title: 'Installation Guide',
      items: [
        { label: 'CLI', href: '#', active: false, badge: '3.0', badgeStyle: 'bg-zinc-900 text-white rounded-md px-1.5 py-0.5' },
        { label: 'Manual', href: '#', active: false },
        { label: 'Tailwind Setup', href: '#', active: false },
        { label: 'Dark Mode', href: '#', active: false },
      ],
    },
    {
      title: 'Blocks',
      items: [
        { label: 'Bento', href: '#', active: false, badge: 'New', badgeStyle: 'bg-emerald-500/10 text-emerald-600 rounded-full px-2 py-0.5' },
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
            {section.items.map((item, itemIdx) => (
              <Link
                key={itemIdx}
                href={item.href}
                className={`flex items-center justify-between py-1.5 text-zinc-600 hover:text-zinc-900 transition-colors ${
                  item.active ? 'text-zinc-900 font-medium' : ''
                }`}
              >
                {item.active ? (
                  <div className="flex items-center w-full bg-zinc-900 text-white px-3 py-1.5 rounded-md shadow-sm">
                    {item.label}
                  </div>
                ) : (
                  <span className="px-3 py-1">{item.label}</span>
                )}
                
                {item.badge && !item.active && (
                  <span className={`text-[10px] font-semibold leading-none ${item.badgeStyle || 'bg-zinc-100 text-zinc-500 rounded-full px-2 py-0.5'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
