import type { DemoLoginUser } from "@/app/lib/recruiter-data";

export const demoSessionStorageKey = "closed-ai-demo-session";

export type DemoSession = Pick<
  DemoLoginUser,
  "email" | "label" | "name" | "route" | "type"
>;

export function saveDemoSession(session: DemoSession) {
  window.localStorage.setItem(demoSessionStorageKey, JSON.stringify(session));
}

export function clearDemoSession() {
  window.localStorage.removeItem(demoSessionStorageKey);
}
