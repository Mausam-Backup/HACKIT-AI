"use client";

import React, { useEffect, useState } from "react";
import EnableMfa from "@/components/auth/EnableMfa";
import LogoutButton from "@/components/auth/LogoutButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/auth/status"), { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!data.authenticated) {
          router.replace("/login");
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        router.replace("/login");
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-syne">
      <div className="w-full max-w-5xl mx-auto px-6 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-[#494A4D] hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-[#000509e3] dark:text-inherit font-extrabold">
            Account Security & Sessions
          </h1>
          <p className="text-sm text-[#0007149f] dark:text-gray-100 font-normal max-w-2xl">
            Manage your account security, set up Two-Factor Authentication, and sign out of your current session.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="relative w-full">
              <div 
                className="absolute top-0 h-full w-px bg-gradient-to-b from-[#EDEEEF] to-transparent left-[0.6rem]" 
              />

              <div className="flex flex-col gap-5">
                <div className="relative pl-8 transition duration-200 ease-in-out">
                  <div className="bg-white absolute -left-[4px] top-7 z-10 block h-5 w-5 rounded-full shadow-sm">
                    <div className="ml-1 mt-1 h-3 w-3 rounded-full border-2 transition duration-200 ease-in-out border-[#7C51F8]"></div>
                  </div>
                  <div>
                    <EnableMfa />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="w-full rounded-[20px] border border-[#EDEEEF] bg-white p-6 shadow-sm sticky top-8">
              <div>
                <h4 className="font-unbounded text-lg font-semibold text-black">Active Session</h4>
                <p className="mt-2 font-syne text-sm leading-relaxed text-[#494A4D] mb-6">
                  You are currently logged into this deployment. Sign out to end your session securely.
                </p>
              </div>
              <LogoutButton
                label="Sign out"
                className="inline-flex w-full items-center justify-center gap-2 rounded-[58px] border border-[#EDEEEF] bg-[#7C51F8] px-5 py-3 font-syne text-sm font-semibold text-white transition hover:bg-[#6d46e6] shadow-sm hover:shadow"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
