"use client";

import { clearDemoSession } from "@/app/lib/demo-session";
import { useRouter } from "next/navigation";

export function DemoLogoutButton() {
  const router = useRouter();

  return (
    <button
      className="min-h-10 rounded-full bg-[var(--surface)] px-4 text-[15px] font-medium leading-[1.47] text-[var(--ink)] shadow-[var(--shadow-outline)] transition hover:bg-[var(--warm-stone)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
      onClick={() => {
        clearDemoSession();
        router.replace("/");
      }}
      type="button"
    >
      Log out
    </button>
  );
}
