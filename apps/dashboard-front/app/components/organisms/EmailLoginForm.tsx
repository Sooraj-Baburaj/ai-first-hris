"use client";

import {
  demoLoginUsers,
  demoUserTypes,
  resolveDemoLogin,
  type DemoUserType,
} from "@/app/lib/recruiter-data";
import { saveDemoSession } from "@/app/lib/demo-session";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmailLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("candidate@closedai.com");
  const [userType, setUserType] = useState<DemoUserType>("candidate");
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const login = resolveDemoLogin(email, userType);
    saveDemoSession(login);
    setSent(true);
    router.push(login.route);
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
            setSent(false);
          }}
          placeholder="candidate@closedai.com"
          required
          type="email"
          value={email}
        />
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-medium leading-[1.43] tracking-[0.14px] text-[var(--ink)]">
          View as
        </p>
        <div className="grid grid-cols-3 gap-2 rounded-full bg-[var(--surface-soft)] p-1 shadow-[var(--shadow-inset)]">
          {demoUserTypes.map((type) => (
            <button
              className={`min-h-10 rounded-full px-3 text-sm font-medium leading-[1.43] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
                userType === type.value
                  ? "bg-[var(--ink)] text-[var(--surface)] shadow-[var(--shadow-card)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
              }`}
              key={type.value}
              onClick={() => {
                setUserType(type.value);
                setSent(false);
              }}
              type="button"
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
      <button
        className="min-h-12 rounded-full bg-[var(--ink)] px-5 text-[15px] font-medium leading-[1.47] text-[var(--surface)] shadow-[var(--shadow-card)] transition hover:bg-[var(--muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        type="submit"
      >
        {sent ? "Opening workspace" : "Continue"}
      </button>
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
                setUserType(user.type);
                setSent(false);
              }}
              type="button"
            >
              <span>{user.email}</span>
              <span className="text-xs font-normal text-[var(--quiet)]">
                {user.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
        No password for this MVP. The email and selected user type pick a demo
        route; unknown emails open the candidate portal.
      </p>
    </form>
  );
}
