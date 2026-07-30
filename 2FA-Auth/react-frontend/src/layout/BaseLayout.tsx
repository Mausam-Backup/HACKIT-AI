import { Outlet } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/theme-provider";

const BaseLayout = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`w-full min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${theme === 'dark' ? "bg-[#24252f]" : "bg-[#f4f6f8]"}`}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/10 dark:bg-white/10 text-gray-800 dark:text-white hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Left Panel - Image */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 relative p-8 flex-col justify-between overflow-hidden m-4 rounded-3xl">
        <div className="absolute inset-0 bg-[url('/auth-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/30" /> {/* Subtle overlay for text readability */}
        
        {/* Logo/Top Bar */}
        <div className="relative z-10 flex justify-between items-center w-full">
          <div className="flex items-center gap-2 text-white">
            <img src="/logo.png" alt="Aegis Logo" className="h-6 w-auto object-contain" />
            <span className="font-bold text-xl tracking-widest">AEGIS</span>
          </div>
          <button className="text-white/80 hover:text-white text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm transition-colors">
            Back to website &rarr;
          </button>
        </div>

        {/* Bottom Text */}
        <div className="relative z-10 w-full pb-8">
          <h2 className="text-white text-4xl font-medium tracking-tight text-center">
            Capturing Moments,<br />Creating Memories
          </h2>
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-6 h-1 rounded-full bg-white/30" />
            <div className="w-6 h-1 rounded-full bg-white/30" />
            <div className="w-6 h-1 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-[450px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BaseLayout;
