export default function DesktopOnlyModal() {
  return (
    <div className="flex lg:hidden fixed inset-0 z-[99999] bg-[#07080c] flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 mb-6 text-violet-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">Desktop View Required</h2>
      <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
        For the best experience, please open this website on a desktop or laptop. Our advanced GSAP animations and interactive workspaces are currently not supported on mobile viewports.
      </p>
    </div>
  );
}
