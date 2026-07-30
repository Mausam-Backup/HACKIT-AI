import type { Metadata } from "next";
import "./globals.css";
import { Geist, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const outfit = Outfit({subsets:['latin'],variable:'--font-outfit'});

export const metadata: Metadata = {
  title: "HAC-KIT AI | Your Ultimate Hackathon Wingman",
  description:
    "HAC-KIT AI is your ultimate hackathon wingman — AI-powered guidance from problem selection to final pitch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, outfit.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@200;260;300;360;370;400;430;500;520;560;600;650;680;700;740;760&family=Inter:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css"
        />
      </head>
      <body>
        <Providers>
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
