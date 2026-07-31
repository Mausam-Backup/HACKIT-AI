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

              <div className="flex flex-col gap-5 pb-10">
                <div className="relative pl-8 transition duration-200 ease-in-out">
                  <div className="bg-white absolute -left-[4px] top-7 z-10 block h-5 w-5 rounded-full shadow-sm">
                    <div className="ml-1 mt-1 h-3 w-3 rounded-full border-2 transition duration-200 ease-in-out border-[#7C51F8]"></div>
                  </div>
                  <div>
                    <EnableMfa />
                  </div>
                </div>

                <div className="relative pl-8 pt-6 mt-4 transition duration-200 ease-in-out">
                  <div className="bg-white absolute -left-[4px] top-10 z-10 block h-5 w-5 rounded-full shadow-sm">
                    <div className="ml-1 mt-1 h-3 w-3 rounded-full border-2 transition duration-200 ease-in-out border-[#7C51F8]"></div>
                  </div>
                  <div>
                    <div className="flex flex-col gap-4 bg-white border border-[#EDEEEF] rounded-[20px] p-6 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-[#000509e3] tracking-tight">Active Sessions</h3>
                          <p className="text-sm text-[#494A4D] mt-1">Review and manage devices currently logged into your account.</p>
                        </div>
                        <button className="text-sm text-red-500 hover:text-red-600 font-medium px-4 py-2 bg-red-50 hover:bg-red-100 rounded-full transition-colors hidden sm:block">
                          Revoke All Other Sessions
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-4">
                        {/* Current Session */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-[#EDEEEF]">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#7C51F8]/10 rounded-full flex items-center justify-center text-[#7C51F8] shrink-0">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-semibold text-gray-900">Windows PC • Chrome</h4>
                                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">Current Session</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">Bhopal, Madhya Pradesh, Kothri Kalan • Active now</p>
                            </div>
                          </div>
                        </div>

                        {/* Other Session 1 */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#EDEEEF]">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Vivo V27 Pro • Safari</h4>
                              <p className="text-sm text-gray-500 mt-1">Bhopal, Madhya Pradesh, Kothri Kalan • Active today</p>
                            </div>
                          </div>
                          <button className="text-sm text-red-500 hover:text-red-700 font-medium px-2">Revoke</button>
                        </div>

                        {/* Other Session 2 */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#EDEEEF]">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Samsung F23 • Edge</h4>
                              <p className="text-sm text-gray-500 mt-1">Bhopal, Madhya Pradesh, Kothri Kalan • Active today</p>
                            </div>
                          </div>
                          <button className="text-sm text-red-500 hover:text-red-700 font-medium px-2">Revoke</button>
                        </div>

                      </div>
                    </div>
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
