"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FormField } from "@/components/patterns";
import { Button } from "@/components/ui";
import { updatePassword } from "../actions";

/**
 * Reached from the password reset email via /auth/callback, which signs the
 * person in before sending them here. Built from the same pieces as sign-in.
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      setPasswordError("Enter a password with at least 8 characters");
      return;
    }
    setPasswordError("");

    // On success the server action redirects to the dashboard for the role.
    setIsLoading(true);
    const result = await updatePassword({ password });
    setIsLoading(false);
    if (!result.ok) {
      setPasswordError(result.fieldErrors.password ?? result.formError ?? "");
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Title */}
      <div className="space-y-1.5">
        <h1 className="font-display text-[28px] sm:text-[32px] leading-tight font-normal text-midnight">
          Choose a new password
        </h1>
        <p className="font-sans text-xs text-slate">
          You will stay signed in after saving it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField
          id="reset-password"
          label="New password"
          error={passwordError}
          inputProps={{
            type: "password",
            autoComplete: "new-password",
            value: password,
            onChange: (e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError("");
            },
            placeholder: "At least 8 characters",
          }}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            Save new password
          </Button>
        </div>
      </form>

      <div className="text-center pt-2">
        <p className="font-sans text-xs text-slate">
          Link expired?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-midnight hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
          >
            Request a new one
          </Link>
        </p>
      </div>
    </div>
  );
}

