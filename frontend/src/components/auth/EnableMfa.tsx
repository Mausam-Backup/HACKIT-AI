"use client";
import React, { useCallback, useState, useEffect } from "react";
import { z } from "zod";
import { Check, Copy, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/components/ui/sonner";
import RevokeMfa from "./RevokeMfa";
import { getApiUrl } from "@/utils/api";

const EnableMfa = () => {
  const [showKey, setShowKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [mfaData, setMfaData] = useState<{ secret: string; qr_code_svg: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const fetchAuthStatus = async () => {
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/status"), { credentials: "include" });
      const data = await res.json();
      setIs2FAEnabled(!!data["2fa_enabled"]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  useEffect(() => {
    if (isOpen && !mfaData && !isLoading) {
      const fetchMfaSetup = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(getApiUrl("/api/v1/auth/setup-2fa"), {
            method: "POST",
            credentials: "include",
          });
          const data = await res.json();
          setMfaData(data);
        } catch (e) {
          notify.error("Error", "Could not load MFA setup.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchMfaSetup();
    }
  }, [isOpen, mfaData, isLoading]);

  const FormSchema = z.object({
    pin: z.string().min(6, {
      message: "Your one-time password must be 6 characters.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsPending(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/verify-setup-2fa"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: values.pin }),
      });
      if (!res.ok) throw new Error("Invalid code");
      setIsOpen(false);
      notify.success("Success", "Multi-Factor Authentication enabled successfully.");
      await fetchAuthStatus();
    } catch (error: any) {
      notify.error("Error", error.message || "Failed to verify code.");
    } finally {
      setIsPending(false);
    }
  };

  const onCopy = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, []);

  return (
    <div className="via-root to-root rounded-xl bg-gradient-to-r p-0.5">
      <div className="rounded-[10px] p-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
            Multi-Factor Authentication (MFA)
          </h3>
          {is2FAEnabled && (
            <span
              className="select-none whitespace-nowrap font-medium bg-green-100 text-green-500
          text-xs h-6 px-2 rounded flex flex-row items-center justify-center gap-1"
            >
              Enabled
            </span>
          )}
        </div>

        <p className="mb-6 text-sm text-[#0007149f] dark:text-gray-100 font-normal">
          Protect your account by adding an extra layer of security.
        </p>
        {is2FAEnabled ? (
          <RevokeMfa onRevoked={fetchAuthStatus} />
        ) : (
          <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button disabled={isLoading} className="inline-flex h-[35px] items-center justify-center gap-2 rounded-[5px] bg-[#000000] px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
                Enable MFA
              </button>
            </DialogTrigger>
            <DialogContent className="!gap-0">
              <DialogHeader>
                <DialogTitle className="text-[17px] text-slate-12 font-semibold">
                  Setup Multi-Factor Authentication
                </DialogTitle>
              </DialogHeader>
              <div className="">
                <p className="mt-6 text-sm text-[#0007149f] dark:text-inherit font-bold">
                  Scan the QR code
                </p>
                <span className="text-sm text-[#0007149f] dark:text-inherit font-normal">
                  Use an app like{" "}
                  <a
                    className="!text-primary underline decoration-primary decoration-1 underline-offset-2 transition duration-200 ease-in-out hover:decoration-blue-11 dark:text-current dark:decoration-slate-9 dark:hover:decoration-current "
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://support.1password.com/one-time-passwords/"
                  >
                    1Password
                  </a>{" "}
                  or{" "}
                  <a
                    className="!text-primary underline decoration-primary decoration-1 underline-offset-2 transition duration-200 ease-in-out hover:decoration-blue-11 dark:text-current dark:decoration-slate-9 dark:hover:decoration-current "
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://safety.google/authentication/"
                  >
                    Google Authenticator
                  </a>{" "}
                  to scan the QR code below.
                </span>
              </div>
              <div className="mt-4 flex flex-row items-center gap-4">
                <div className=" shrink-0 rounded-md border p-2  border-[#0009321f] dark:border-gray-600 bg-white">
                  {isLoading || !mfaData?.qr_code_svg ? (
                    <Skeleton className="w-[160px] h-[160px]" />
                  ) : (
                    <div 
                      className="w-[160px] h-[160px] rounded-md [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: mfaData.qr_code_svg }}
                    />
                  )}
                </div>

                {showKey ? (
                  <div className="w-full">
                    <div
                      className="flex items-center gap-1
                              text-sm text-[#0007149f] dark:text-muted-foreground font-normal"
                    >
                      <span>Copy setup key</span>
                      <button
                        disabled={copied}
                        onClick={() => onCopy(mfaData?.secret || "")}
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm block truncate w-[200px] text-black dark:text-muted-foreground">
                      {mfaData?.secret}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-[#0007149f] dark:text-muted-foreground font-normal">
                    Can't scan the code?
                    <button
                      className="block text-primary transition duration-200 ease-in-out hover:underline
                   dark:text-white"
                      type="button"
                      onClick={() => setShowKey(true)}
                    >
                      View the Setup Key
                    </button>
                  </span>
                )}
              </div>

              <div className="mt-8 border-t">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full mt-6 flex flex-col gap-4 "
                  >
                    <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-sm mb-1 text-slate-11 font-bold">
                             Then enter the code
                           </FormLabel>
                           <FormControl>
                             <InputOTP
                               className="!text-lg flex items-center"
                               maxLength={6}
                               pattern={REGEXP_ONLY_DIGITS}
                               {...field}
                               style={{ justifyContent: "center" }}
                             >
                               <InputOTPGroup>
                                 <InputOTPSlot index={0} className="!w-14 !h-12 !text-lg" />
                                 <InputOTPSlot index={1} className="!w-14 !h-12 !text-lg" />
                               </InputOTPGroup>
                               <InputOTPGroup>
                                 <InputOTPSlot index={2} className="!w-14 !h-12 !text-lg" />
                                 <InputOTPSlot index={3} className="!w-14 !h-12 !text-lg" />
                               </InputOTPGroup>
                               <InputOTPGroup>
                                 <InputOTPSlot index={4} className="!w-14 !h-12 !text-lg" />
                                 <InputOTPSlot index={5} className="!w-14 !h-12 !text-lg" />
                               </InputOTPGroup>
                             </InputOTP>
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                      )}
                    />
                    <button type="submit" disabled={isPending} className="inline-flex w-full h-[40px] items-center justify-center gap-2 rounded-md bg-[#000000] px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 mt-2">
                      {isPending && <Loader className="animate-spin w-4 h-4" />}
                      Verify
                    </button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default EnableMfa;
