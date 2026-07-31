"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getApiUrl } from "@/utils/api";
import { isAuthDisabled } from "@/utils/auth";
import { formatFastApiDetail, UNAUTHORIZED_DETAIL } from "@/utils/authErrors";
import { Loader2 } from "lucide-react";
import { notify } from "@/components/ui/sonner";
import { sanitizeAnalyticsError } from "@/utils/analytics";
import { MixpanelEvent, trackEvent } from "@/utils/mixpanel";

type AuthStatus = {
  configured: boolean;
  authenticated: boolean;
  username: string | null;
};

const initialStatus: AuthStatus = {
  configured: false,
  authenticated: false,
  username: null,
};

export default function AuthGate() {
  const [status, setStatus] = useState<AuthStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [is2faMode, setIs2faMode] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [isVerifyMode, setIsVerifyMode] = useState(false);
  const [emailCode, setEmailCode] = useState("");

  useEffect(() => {
    setIsSetupMode(!status.configured);
  }, [status.configured]);



  useEffect(() => {
    if (isAuthDisabled()) {
      trackEvent(MixpanelEvent.Auth_Status_Checked, {
        configured: true,
        authenticated: true,
        auth_disabled: true,
      });
      setStatus({
        configured: true,
        authenticated: true,
        username: "electron",
      });
      setIsLoading(false);
      return;
    }

    void refreshStatus();
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isLoading ||
      !status.authenticated ||
      isRedirecting
    ) {
      return;
    }

    setIsRedirecting(true);
    window.location.replace("/account");
  }, [isLoading, isRedirecting, status.authenticated]);

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "unauthorized") {
      if (status.configured && !status.authenticated) {
        notify.error("Unauthorized", "Sign in to view this page.", {
          id: "auth-unauthorized-redirect",
          duration: 5000,
        });
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isLoading, status.authenticated, status.configured]);

  const refreshStatus = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/v1/auth/status"), {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not load login state");
      }

      const data = (await response.json()) as AuthStatus;
      trackEvent(MixpanelEvent.Auth_Status_Checked, {
        configured: Boolean(data.configured),
        authenticated: Boolean(data.authenticated),
        auth_disabled: false,
      });
      setStatus({
        configured: Boolean(data.configured),
        authenticated: Boolean(data.authenticated),
        username: data.username ?? null,
      });
    } catch (fetchError) {
      console.error(fetchError);
      trackEvent(MixpanelEvent.Auth_Status_Checked, {
        configured: false,
        authenticated: false,
        auth_disabled: false,
        error_message: sanitizeAnalyticsError(
          fetchError,
          "Could not load login state"
        ),
      });
      notify.error(
        "Could not load login",
        "We could not connect to the login service. Please refresh and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isVerifyMode) {
      if (emailCode.length < 6) {
        notify.warning("Code too short", "Verification code must be 6 digits.");
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await fetch(getApiUrl("/api/v1/auth/verify-email"), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: emailCode, username: username.trim() }),
        });
        const payload = await response.json();
        if (!response.ok) {
           notify.error("Verification failed", formatFastApiDetail(payload?.detail));
           return;
        }
        setStatus({
          configured: true,
          authenticated: true,
          username: payload.username ?? username.trim(),
        });
        notify.success("Account created", "Your email has been verified and you are now logged in.");
      } catch (e) {
        notify.error("Verification unavailable", "Could not verify your code.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const cleanedUsername = username.trim();
    if (cleanedUsername.length < 3) {
      notify.warning(
        "Username too short",
        "Your username must be at least 3 characters."
      );
      return;
    }

    if (password.length < 6) {
      notify.warning(
        "Password too short",
        "Your password must be at least 6 characters."
      );
      return;
    }

    if (isSetupMode && password !== confirmPassword) {
      notify.warning(
        "Passwords do not match",
        "Make sure both password fields match before continuing."
      );
      return;
    }

    if (is2faMode && twoFaCode.length < 6) {
      notify.warning("Code too short", "Authenticator code must be 6 digits.");
      return;
    }

    setIsSubmitting(true);
    trackEvent(
      isSetupMode
        ? MixpanelEvent.Auth_Setup_Started
        : MixpanelEvent.Auth_SignIn_Started,
      {
        username_length: cleanedUsername.length,
      }
    );

    try {
      const response = await fetch(
        getApiUrl(isSetupMode ? "/api/v1/auth/setup" : "/api/v1/auth/login"),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: cleanedUsername,
            password,
            code: is2faMode ? twoFaCode : null,
          }),
        }
      );

      const payload = await response.json();
      if (!response.ok) {
        const detail = formatFastApiDetail(payload?.detail);
        trackEvent(
          isSetupMode
            ? MixpanelEvent.Auth_Setup_Failed
            : MixpanelEvent.Auth_SignIn_Failed,
          {
            status_code: response.status,
            error_message: sanitizeAnalyticsError(
              detail,
              isSetupMode ? "Could not create account" : "Sign-in failed"
            ),
          }
        );
        if (response.status === 401) {
          notify.error(
            "Sign-in failed",
            detail === UNAUTHORIZED_DETAIL
              ? "The username or password is incorrect. Please try again."
              : detail
          );
        } else {
          notify.error(
            isSetupMode ? "Could not create account" : "Sign-in failed",
            detail || "Something went wrong. Please try again."
          );
        }
        return;
      }

      if (payload.email_verification_required) {
        setIsVerifyMode(true);
        notify.info("Verification Required", "Please enter the 6-digit code sent to your email.");
        return;
      }

      if (payload["2fa_required"]) {
        setIs2faMode(true);
        notify.info("2FA Required", "Please enter your authenticator code.");
        return;
      }

      if (isSetupMode) {
        trackEvent(MixpanelEvent.Auth_Setup_Completed, {
          username_length: cleanedUsername.length,
        });
        setStatus({
          configured: true,
          authenticated: false,
          username: (payload as AuthStatus).username ?? cleanedUsername,
        });
        setPassword("");
        setConfirmPassword("");
        notify.success("Account created", "Sign in with your new username and password to continue.", {
          duration: 6000,
        });
        return;
      }

      setStatus({
        configured: Boolean((payload as AuthStatus).configured),
        authenticated: Boolean((payload as AuthStatus).authenticated),
        username: (payload as AuthStatus).username ?? cleanedUsername,
      });
      trackEvent(MixpanelEvent.Auth_SignIn_Completed, {
        username_length: cleanedUsername.length,
      });
      setPassword("");
      setConfirmPassword("");
      notify.success(
        "Signed in",
        "Welcome back. Loading your workspace."
      );
    } catch (submitError) {
      console.error(submitError);
      trackEvent(
        isSetupMode
          ? MixpanelEvent.Auth_Setup_Failed
          : MixpanelEvent.Auth_SignIn_Failed,
        {
          status_code: null,
          error_message: sanitizeAnalyticsError(
            submitError,
            isSetupMode ? "Could not create account" : "Login unavailable"
          ),
        }
      );
      notify.error(
        "Login unavailable",
        "The login service is unavailable right now. Please try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isRedirecting || status.authenticated) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f4f6f8] dark:bg-[#24252f]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7e57c2]" />
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col md:flex-row bg-[#f4f6f8] dark:bg-[#24252f] transition-colors duration-300">
      {/* Left Panel - Image */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 h-[calc(100vh-2rem)] relative p-8 flex-col justify-between overflow-hidden m-4 rounded-3xl shrink-0">
        <div className="absolute inset-0 bg-[url('/auth-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Logo/Top Bar */}
        <div className="relative z-10 flex justify-between items-center w-full">
          <div className="flex items-center gap-2 text-white">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain bg-white rounded-md p-1" />
            <span className="font-bold text-xl tracking-widest">HAC-KIT AI</span>
          </div>
          <button onClick={() => window.location.href = "/"} className="text-white/80 hover:text-white text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer">
            Back to website &rarr;
          </button>
        </div>

        {/* Bottom Text */}
        <div className="relative z-10 w-full pb-8">
          <h2 className="text-white text-4xl font-medium tracking-tight text-center">
            Your Ultimate,<br />Hackathon Wingman
          </h2>
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-6 h-1 rounded-full bg-white/30" />
            <div className="w-6 h-1 rounded-full bg-white/30" />
            <div className="w-6 h-1 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 lg:w-7/12 h-full flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[450px]">
          <div className="w-full p-5 rounded-md text-gray-900 dark:text-white">

            <h1 className="text-3xl tracking-tight text-gray-900 dark:text-white font-bold mb-2 text-center sm:text-left">
              {isVerifyMode ? "Verify your email" : isSetupMode ? "Create your admin login" : "Log in to continue"}
            </h1>
            <p className="mb-8 text-center sm:text-left text-sm text-gray-500 dark:text-white/60 font-normal">
              {isVerifyMode
                ? "Enter the 6-digit code sent to your email."
                : isSetupMode
                ? "One-time setup for this deployment."
                : "This deployment is protected."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isVerifyMode ? (
                <div className="mb-4 space-y-2">
                  <label htmlFor="emailCode" className="block text-sm font-medium text-gray-900 dark:text-white">
                    Verification Code
                  </label>
                  <input
                    id="emailCode"
                    type="text"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={emailCode}
                    onChange={(event) => setEmailCode(event.target.value)}
                    placeholder="000000"
                    className="w-full rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 h-12 text-center tracking-widest text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#7e57c2]"
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>
              ) : is2faMode ? (
                <div className="mb-4 space-y-2">
                  <label htmlFor="twoFaCode" className="block text-sm font-medium text-gray-900 dark:text-white">
                    Authenticator Code
                  </label>
                  <input
                    id="twoFaCode"
                    type="text"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={twoFaCode}
                    onChange={(event) => setTwoFaCode(event.target.value)}
                    placeholder="000000"
                    className="w-full rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 h-12 text-center tracking-widest text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#7e57c2]"
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <div className="mb-4 space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-900 dark:text-white">
                      Username
                    </label>
                    <input
                      id="username"
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="your-admin-user"
                      className="w-full rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 h-12 text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#7e57c2]"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="mb-4 space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete={isSetupMode ? "new-password" : "current-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 h-12 text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#7e57c2]"
                      disabled={isSubmitting}
                    />
                  </div>

                  {isSetupMode ? (
                    <div className="mb-4 space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 dark:text-white">
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 h-12 text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#7e57c2]"
                        disabled={isSubmitting}
                      />
                    </div>
                  ) : null}
                </>
              )}

              {!isSetupMode && status.configured && !is2faMode ? (
                <p className="text-xs text-gray-400 dark:text-white/40 font-normal">
                  Setup is complete for this instance. Use the username and password you configured.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-[15px] h-12 mt-6 bg-[#7e57c2] hover:bg-[#6847a3] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? isVerifyMode
                    ? "Verifying…"
                    : isSetupMode
                    ? "Saving credentials…"
                    : is2faMode ? "Verifying…" : "Signing in…"
                  : isVerifyMode
                    ? "Verify Email"
                    : isSetupMode
                    ? "Create account"
                    : is2faMode ? "Verify Code" : "Log in"}
              </button>

              {!is2faMode && !isVerifyMode && (
                <div className="mt-6 text-center text-sm">
                  {isSetupMode ? (
                    <p className="text-gray-500 dark:text-white/60">
                      Already have an admin account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsSetupMode(false)}
                        className="text-[#7e57c2] hover:underline font-medium"
                      >
                        Log in
                      </button>
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-white/60">
                      Need to set up the deployment?{" "}
                      <button
                        type="button"
                        onClick={() => setIsSetupMode(true)}
                        className="text-[#7e57c2] hover:underline font-medium"
                      >
                        Create account
                      </button>
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
