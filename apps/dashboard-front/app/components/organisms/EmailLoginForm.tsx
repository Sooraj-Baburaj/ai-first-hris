"use client";

import { apiPost } from "@/app/lib/api";
import { demoLoginUsers } from "@/app/lib/recruiter-data";
import { saveDemoSession } from "@/app/lib/demo-session";
import type { ResolveRoleResponseDto } from "@closed-ai/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmailLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("candidate@closedai.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const login = await apiPost<ResolveRoleResponseDto>("/api/v1/auth/resolve-role", {
        email,
      });

      saveDemoSession(login);
      router.push(login.route);
    } catch {
      setError("Could not resolve workspace. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-5 rounded-3xl bg-[var(--surface)] p-8 shadow-[var(--shadow-outline)]"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-2">
        <label
          className="text-sm font-medium leading-[1.43] tracking-[0.14px] text-[var(--ink)]"
          htmlFor="work-email"
        >
          Work email
        </label>
        <input
          id="work-email"
          className="min-h-12 rounded-full bg-[var(--surface)] px-5 text-base font-normal leading-[1.5] tracking-[0.16px] text-[var(--ink)] shadow-[var(--shadow-outline)] placeholder:text-[var(--quiet)] focus:shadow-[0_0_0_3px_var(--ring),var(--shadow-outline)]"
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
          placeholder="candidate@closedai.com"
          required
          type="email"
          value={email}
        />
      </div>

      <button
        className="min-h-12 rounded-full bg-[var(--ink)] px-5 text-[15px] font-medium leading-[1.47] text-[var(--surface)] shadow-[var(--shadow-card)] transition hover:bg-[var(--muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Opening workspace" : "Continue"}
      </button>

      {error ? (
        <p className="rounded-2xl bg-[var(--rose-soft)] px-4 py-3 text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2">
        <p className="text-xs font-medium uppercase leading-[1.33] tracking-[0.14em] text-[var(--quiet)]">
          Demo sign-ins
        </p>
        <div className="grid gap-2">
          {demoLoginUsers.map((user) => (
            <button
              className="flex min-h-11 items-center justify-between gap-3 rounded-full bg-[var(--warm-stone)] px-4 text-left text-sm font-medium leading-[1.43] tracking-[0.14px] text-[var(--ink)] shadow-[var(--shadow-warm)] transition hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              key={user.email}
              onClick={() => {
                setEmail(user.email);
                setError(null);
              }}
              type="button"
            >
              <span>{user.email}</span>
              <span className="text-xs font-normal text-[var(--quiet)]">{user.label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
        MVP routing is backend-driven: recruiter email goes to recruiter workspace,
        known employee emails open employee portal, and any other email opens the
        candidate portal.
      </p>
    </form>
  );
}
