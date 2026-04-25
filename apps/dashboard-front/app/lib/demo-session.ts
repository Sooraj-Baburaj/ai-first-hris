import type { DemoSession } from "@/app/lib/recruiter-data";

export const demoSessionStorageKey = "closed-ai-demo-session";

export function saveDemoSession(session: DemoSession) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(demoSessionStorageKey, JSON.stringify(session));
}

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(demoSessionStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function clearDemoSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(demoSessionStorageKey);
}
