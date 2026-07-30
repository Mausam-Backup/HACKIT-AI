import Link from "next/link";

export default function Footer({ bgClass = "bg-black" }: { bgClass?: string }) {
  return (
    <footer className={`site-footer ${bgClass} text-white pb-10 border-t border-zinc-900 relative overflow-hidden`}>
      {/* Background Animated Dots */}
      <div className="footer-dots" aria-hidden="true">
        <div className="footer-dots__line"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16 items-start">
          {/* Main Brand Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
              AI-Powered Hackathon Intelligence
            </h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed">
              The complete toolkit for winning hackathons. Leverage AI to build, pitch, and scale your next big idea.
            </p>
          </div>

          {/* Links Section 1 */}
          <div className="flex flex-col gap-3 lg:col-span-3 lg:pl-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Platform</h3>
            <Link href="/upcoming-hackathons" className="text-zinc-400 hover:text-white transition-colors text-sm font-normal">Hackathons</Link>
            <Link href="/resources" className="text-zinc-400 hover:text-white transition-colors text-sm font-normal">Resources</Link>
            <Link href="/coach" className="text-zinc-400 hover:text-white transition-colors text-sm font-normal">AI Coach</Link>
            <Link href="/interviews" className="text-zinc-400 hover:text-white transition-colors text-sm font-normal">AI Interviews</Link>
          </div>

          {/* Links Section 2 */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Community</h3>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors text-sm font-normal">GitHub</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors text-sm font-normal">Twitter / X</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors text-sm font-normal">LinkedIn</a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-800/50 gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative size-10 rounded-xl bg-white border border-zinc-700/50 flex items-center justify-center overflow-hidden group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1 group-hover:-rotate-6 transition-all duration-300" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">HAC-KIT AI</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-zinc-500 font-medium">
            <p>© 2026 HAC-KIT AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
