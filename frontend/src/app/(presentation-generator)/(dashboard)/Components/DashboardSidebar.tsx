"use client";

import React from "react";
import { LayoutDashboard, Star, Settings, Palette, Plus, ListTree, Sliders, Layout, Brain, Hexagon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";



export const defaultNavItems = [
    { key: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { key: "templates" as const, label: "Standard", icon: Star },
    { key: "designs" as const, label: "Smart", icon: Brain },



];
export const BelongingNavItems = [
    { key: "settings" as const, label: "Settings", icon: Settings },
]

const DashboardSidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/upload", label: "New Deck", icon: Plus },
        { href: "/outline", label: "Outline", icon: ListTree },
        { href: "/presentation", label: "Editor", icon: Sliders },
        { href: "/templates", label: "Templates", icon: Star },
        { href: "/theme", label: "Themes", icon: Palette },
        { href: "/custom-template", label: "Custom", icon: Layout },
    ];

    return (
        <aside
            className="sticky top-0 h-screen w-[125px] flex flex-col justify-between bg-[#F6F6F9] backdrop-blur border-r border-[#E1E1E5] px-3 py-6"
            aria-label="Dashboard sidebar"
        >
            <div>
                <Link href="/dashboard" className="flex flex-col items-center pb-5 border-b border-[#E1E1E5] gap-3 group">
                    <div className="relative size-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/50 flex items-center justify-center overflow-hidden group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 shadow-md">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white group-hover:text-amber-400 group-hover:-rotate-6 transition-all duration-300">
                            <path d="M 9 4 L 5 4 L 5 18 L 9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M 15 6 L 19 6 L 19 20 L 15 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M 5 12 L 19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M 20 0 C 20 1.5 21.5 3 23 3 C 21.5 3 20 4.5 20 6 C 20 4.5 18.5 3 17 3 C 18.5 3 20 1.5 20 0 Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <span className="font-bold text-xs tracking-tight text-zinc-900">HAC-KIT AI</span>
                </Link>
                <nav className="pt-4 font-syne" aria-label="Dashboard sections">
                    <div className="space-y-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    prefetch={false}
                                    href={item.href}
                                    className={[
                                        "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all text-center",
                                        isActive ? "bg-[#7C51F8]/10 text-[#5146E5] font-semibold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                    ].join(" ")}
                                    title={item.label}
                                >
                                    <Icon className={["h-4 w-4", isActive ? "text-[#5146E5]" : "text-slate-600"].join(" ")} />
                                    <span className="text-[11px] leading-tight">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>

            <div className="pt-4 border-t border-[#E1E1E5] font-syne space-y-3">
                <Link
                    prefetch={false}
                    href="/settings"
                    className={[
                        "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all text-center",
                        pathname.startsWith("/settings") ? "bg-[#7C51F8]/10 text-[#5146E5] font-semibold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")}
                    title="Settings"
                >
                    <Settings className={["h-4 w-4", pathname.startsWith("/settings") ? "text-[#5146E5]" : "text-slate-600"].join(" ")} />
                    <span className="text-[11px] leading-tight">Settings</span>
                </Link>
                <Link href="/" className="flex flex-col items-center gap-1 p-1 text-slate-500 hover:text-slate-900 text-center">
                    <span className="text-[10px] font-medium">← Main App</span>
                </Link>
            </div>
        </aside>
    );
};

export default DashboardSidebar;


