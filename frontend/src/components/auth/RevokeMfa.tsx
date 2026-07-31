"use client";
import React, { useState } from "react";
import { Loader } from "lucide-react";
import { notify } from "@/components/ui/sonner";
import { getApiUrl } from "@/utils/api";

const RevokeMfa = ({ onRevoked }: { onRevoked: () => void }) => {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (!confirm("Are you sure you want to disable 2FA?")) return;
    setIsPending(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/disable-2fa"), {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        notify.success("Success", "2FA has been disabled successfully.");
        onRevoked();
      } else {
        notify.error("Error", "Could not disable 2FA.");
      }
    } catch (e: any) {
      notify.error("Error", e.message || "Failed to disable 2FA");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-[58px] border border-[#EDEEEF] bg-red-50 px-5 py-3 font-syne text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed"
      onClick={handleClick}
    >
      {isPending && <Loader className="animate-spin w-4 h-4" />}
      Revoke Access
    </button>
  );
};

export default RevokeMfa;
