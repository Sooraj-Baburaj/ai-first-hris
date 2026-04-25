import { defaultRecruiterRoute } from "@/app/lib/recruiter-data";
import { redirect } from "next/navigation";

export default function CandidatesPage() {
  redirect(defaultRecruiterRoute);
}
