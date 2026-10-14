"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/patterns";
import { Button, Label } from "@/components/ui";
import { cn } from "@/lib/utils";

interface RoleOption {
  id: "client" | "photographer" | "vendor";
  title: string;
  detail: string;
  requiresVerification: boolean;
}

const ROLES: RoleOption[] = [
  {
    id: "client",
    title: "Client or agency",
    detail: "Book or post a gig",
    requiresVerification: false,
  },
  {
    id: "photographer",
    title: "Photographer or mentor",
    detail: "Verification follows",
    requiresVerification: true,
  },
  {
    id: "vendor",
    title: "Vendor or location owner",
    detail: "Verification follows",
    requiresVerification: true,
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleOption["id"]>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
    if (!password || password.length < 8) {
      setPasswordError("Enter a password with at least 8 characters");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    // Simulate account creation
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Route to chosen role portal
      if (selectedRole === "client") router.push("/client");
      else if (selectedRole === "photographer") router.push("/photographer");
      else router.push("/vendor");
    }, 1000);
  };

  const handleRoleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedRole(ROLES[index].id);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % ROLES.length;
      setSelectedRole(ROLES[nextIndex].id);
      document.getElementById(`role-${ROLES[nextIndex].id}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + ROLES.length) % ROLES.length;
      setSelectedRole(ROLES[prevIndex].id);
      document.getElementById(`role-${ROLES[prevIndex].id}`)?.focus();
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Title */}
      <div className="space-y-1.5">
        <h1 className="font-display text-[28px] sm:text-[32px] leading-tight font-normal text-midnight">
          Create your account
        </h1>
        <p className="font-sans text-xs text-slate">
          Join Momnt to book, work, or list verified photography services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Role selector as a radio group */}
        <div className="space-y-2">
          <Label id="role-group-label" className="font-sans text-sm font-medium text-slate block">
            I am joining as
          </Label>

          <div
            role="radiogroup"
            aria-labelledby="role-group-label"
            className="space-y-2"
          >
            {ROLES.map((role, idx) => {
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  id={`role-${role.id}`}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSelectedRole(role.id)}
                  onKeyDown={(e) => handleRoleKeyDown(e, idx)}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-3 sm:p-3.5 transition-colors cursor-pointer select-none outline-none",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]",
                    isSelected
                      ? "border border-midnight border-l-[3px] border-l-brass bg-muted/20"
                      : "border border-[#CFCFCB] bg-transparent hover:bg-muted/10"
                  )}
                >
                  <span className="font-sans text-sm font-medium text-midnight">
                    {role.title}
                  </span>
                  <span className="font-sans text-xs text-slate">
                    {role.detail}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email Field */}
        <FormField
          id="signup-email"
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

        {/* Password Field */}
        <FormField
          id="signup-password"
          label="Password"
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

        {/* Single Primary Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            Create account
          </Button>
        </div>
      </form>

      {/* Quiet Link to Sign In */}
      <div className="text-center pt-2">
        <p className="font-sans text-xs text-slate">
          Already here?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-midnight hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
