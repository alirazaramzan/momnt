"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormField } from "@/components/patterns";
import { Button, Input, Label } from "@/components/ui";
import { requestPasswordReset, signIn } from "../actions";

/**
 * Messages driven by the URL: ?check=email after sign-up, ?error=link when an
 * email link has expired. Reads the query string, so it sits behind Suspense
 * and the rest of the page still prerenders (Cache Components).
 */
function SignInNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("error") === "link") {
    return (
      <p role="alert" className="text-xs text-alert font-medium font-sans leading-tight">
        That link has expired or was already used. Sign in, or request a new link.
      </p>
    );
  }

  if (searchParams.get("check") !== "email") return null;

  // Sign-up confirmation banner state (same style as the reset banner)
  return (
    <div
      role="status"
      aria-live="polite"
      className="border border-[#1E7A5C]/40 bg-[#1E7A5C]/10 p-3.5 rounded-[2px] text-xs font-sans text-midnight space-y-1"
    >
      <p className="font-semibold text-[#1E7A5C]">Check your email to confirm your account</p>
      <p className="text-slate">
        Open the link we sent you, then sign in here.
      </p>
    </div>
  );
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    // Validate email
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setEmailError("Enter an email like name@example.com");
      valid = false;
    } else {
      setEmailError("");
    }

    // Validate password
    if (!password) {
      setPasswordError("Enter your password");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    // On success the server action redirects to the dashboard for the role.
    setIsLoading(true);
    const result = await signIn({ email, password });
    setIsLoading(false);
    if (!result.ok) {
      setEmailError(result.fieldErrors.email ?? "");
      setPasswordError(result.fieldErrors.password ?? result.formError ?? "");
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes("@")) {
      setEmailError("Enter an email like name@example.com");
      return;
    }
    setResetLoading(true);
    const result = await requestPasswordReset({ email });
    setResetLoading(false);
    if (result.ok) {
      setResetSent(true);
    } else {
      setEmailError(result.fieldErrors.email ?? result.formError ?? "");
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Title */}
      <div className="space-y-1.5">
        <h1 className="font-display text-[28px] sm:text-[32px] leading-tight font-normal text-midnight">
          Sign in
        </h1>
        <p className="font-sans text-xs text-slate">
          Access your bookings, proposals, and projects.
        </p>
      </div>

      <Suspense fallback={null}>
        <SignInNotice />
      </Suspense>

      {/* Password reset confirmation banner state */}
      {resetSent && (
        <div
          role="status"
          aria-live="polite"
          className="border border-[#1E7A5C]/40 bg-[#1E7A5C]/10 p-3.5 rounded-[2px] text-xs font-sans text-midnight space-y-1"
        >
          <p className="font-semibold text-[#1E7A5C]">Reset email dispatched</p>
          <p className="text-slate">
            If an account exists for {email}, we sent a reset link to your inbox.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field */}
        <FormField
          id="signin-email"
          label="Email"
          error={emailError}
          inputProps={{
            type: "email",
            autoComplete: "email",
            value: email,
            onChange: (e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            },
            placeholder: "name@example.com",
          }}
        />

        {/* Password Field & Inline Forgot Password Action */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="signin-password">Password</Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="font-sans text-xs text-slate hover:text-midnight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
            >
              {resetLoading ? "Sending..." : "Forgot password?"}
            </button>
          </div>

          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError("");
            }}
            placeholder="••••••••"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "signin-password-error" : undefined}
            className={passwordError ? "border-alert focus-visible:outline-alert" : undefined}
          />
          {passwordError && (
            <p
              id="signin-password-error"
              role="alert"
              className="text-xs text-alert font-medium font-sans leading-tight mt-1"
            >
              {passwordError}
            </p>
          )}
        </div>

        {/* Single Primary Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            Sign in
          </Button>
        </div>
      </form>

      {/* Quiet Link to Sign Up */}
      <div className="text-center pt-2">
        <p className="font-sans text-xs text-slate">
          New to Momnt?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-midnight hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
