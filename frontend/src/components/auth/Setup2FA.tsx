"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { notify } from "@/components/ui/sonner";
import { getApiUrl } from "@/utils/api";

export default function Setup2FA() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaData, setMfaData] = useState<{ secret: string; qr_code_svg: string } | null>(null);
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleEnableClick = async () => {
    setIsLoading(true);
    setIsOpen(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/setup-2fa"), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to setup 2FA");
      const data = await res.json();
      setMfaData(data);
    } catch (e) {
      notify.error("Error", "Could not initiate 2FA setup");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (pin.length < 6) {
      notify.warning("Invalid PIN", "Please enter a 6-digit PIN");
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/verify-setup-2fa"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: pin }),
      });
      if (!res.ok) throw new Error("Invalid 2FA code");
      notify.success("Success", "2FA has been successfully enabled.");
      setIsOpen(false);
      setPin("");
    } catch (e) {
      notify.error("Verification failed", "The code you entered is invalid.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm("Are you sure you want to disable 2FA?")) return;
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/disable-2fa"), {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        notify.success("Disabled", "2FA has been disabled.");
        setIsOpen(false);
      } else {
        notify.error("Error", "Could not disable 2FA");
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-4">
        {!isOpen ? (
          <button
            onClick={handleEnableClick}
            className="inline-flex items-center justify-center gap-2 rounded-[58px] border border-[#EDEEEF] bg-white px-5 py-3 font-syne text-xs font-semibold text-black transition hover:bg-gray-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Setup Two-Factor Authentication
          </button>
        ) : null}

        <button
          onClick={handleDisable}
          className="inline-flex items-center justify-center gap-2 rounded-[58px] border border-[#EDEEEF] bg-red-50 px-5 py-3 font-syne text-xs font-semibold text-red-600 transition hover:bg-red-100"
        >
          Disable 2FA
        </button>
      </div>

      {isOpen && mfaData && (
        <div className="p-5 border rounded-[20px] border-[#EDEEEF] bg-white space-y-4">
          <h4 className="font-syne font-semibold text-black text-lg">Scan QR Code</h4>
          <p className="font-syne text-sm text-[#494A4D]">
            Use an authenticator app like Google Authenticator or Authy to scan this QR code.
          </p>
          
          <div 
            className="bg-white p-2 w-[200px] h-[200px] rounded-md border inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" 
            dangerouslySetInnerHTML={{ __html: mfaData.qr_code_svg }} 
          />
          
          <p className="font-syne text-sm text-[#494A4D]">
            Manual Entry Key: <strong className="text-black select-all">{mfaData.secret}</strong>
          </p>
          
          <div className="space-y-2 mt-4">
            <label className="block font-syne text-sm font-medium text-black">
              Enter 6-digit code to verify
            </label>
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="000000"
              className="w-full max-w-[200px] rounded-[11px] border border-[#EDEEEF] bg-white px-4 py-3 font-syne text-sm text-black outline-none focus:border-[#a49cfc] focus:ring-2 focus:ring-[#5146E5]/20 tracking-widest text-xl text-center"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="inline-flex items-center justify-center gap-2 rounded-[58px] bg-[#7C51F8] px-5 py-3 font-syne text-xs font-semibold text-white hover:bg-[#6d46e6]"
            >
              {isVerifying ? "Verifying..." : "Verify & Enable"}
            </button>
            <button
              onClick={() => { setIsOpen(false); setPin(""); }}
              className="inline-flex items-center justify-center gap-2 rounded-[58px] border border-[#EDEEEF] bg-white px-5 py-3 font-syne text-xs font-semibold text-black hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
