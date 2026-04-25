"use client";

import { DemoLogoutButton } from "@/app/components/molecules/DemoLogoutButton";
import { apiBaseUrl } from "@/app/lib/api";
import { getDemoSession } from "@/app/lib/demo-session";
import type {
  CandidateJobListResponseDto,
  CandidateStatusResponseDto,
  ResumeSubmissionResponseDto,
} from "@closed-ai/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function toLabel(value: string) {
  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function CandidatePortalExperience() {
  const [email] = useState<string>(() => getDemoSession()?.email ?? "candidate@closedai.com");
  const [status, setStatus] = useState<CandidateStatusResponseDto["status"] | null>(null);
  const [jobs, setJobs] = useState<CandidateJobListResponseDto["items"]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [jobsResponse, statusResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/v1/candidate/jobs?email=${encodeURIComponent(email)}`, {
            cache: "no-store",
          }),
          fetch(`${apiBaseUrl}/api/v1/candidate/status?email=${encodeURIComponent(email)}`, {
            cache: "no-store",
          }),
        ]);

        if (!jobsResponse.ok) {
          throw new Error("Jobs request failed");
        }

        const jobsPayload = (await jobsResponse.json()) as CandidateJobListResponseDto;

        if (!cancelled) {
          setJobs(jobsPayload.items);
          if (!selectedJobId && jobsPayload.items.length > 0) {
            setSelectedJobId(jobsPayload.items[0].job.id);
          }
        }

        if (statusResponse.status === 404) {
          if (!cancelled) {
            setStatus(null);
            setIsLoading(false);
          }
          return;
        }

        if (!statusResponse.ok) {
          throw new Error("Status request failed");
        }

        const statusPayload = (await statusResponse.json()) as CandidateStatusResponseDto;

        if (!cancelled) {
          setStatus(statusPayload.status);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load jobs or application status.");
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [email, selectedJobId]);

  const timeline = useMemo(() => status?.timeline ?? [], [status]);

  async function handleResumeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedJobId) {
      setUploadState("error");
      setError("Select a job first.");
      return;
    }

    if (!selectedFile) {
      setUploadState("error");
      setError("Attach a PDF or TXT resume before submitting.");
      return;
    }

    setUploadState("uploading");
    setError(null);
    const toastId = toast.loading("Resume upload in progress...");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("jobId", selectedJobId);
    formData.append("resume", selectedFile);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/candidate/resume`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const payload = (await response.json()) as ResumeSubmissionResponseDto;
      setStatus(payload.status);
      setUploadState("success");
      setSelectedFile(null);
      toast.success("Resume uploaded successfully.", { id: toastId });

      const jobsResponse = await fetch(
        `${apiBaseUrl}/api/v1/candidate/jobs?email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      if (jobsResponse.ok) {
        const jobsPayload = (await jobsResponse.json()) as CandidateJobListResponseDto;
        setJobs(jobsPayload.items);
      }
    } catch {
      setUploadState("error");
      setError("Resume upload failed. Please retry with a valid PDF or TXT file.");
      toast.error("Resume upload failed.", { id: toastId });
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="grid content-between gap-8 rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow-outline)] lg:p-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                className="flex w-fit items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ring)]"
                href="/"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[var(--ink)] font-display text-lg font-light text-[var(--background)] shadow-[var(--shadow-card)]">
                  C
                </span>
                <span className="text-[15px] font-medium leading-[1.33] tracking-[0.15px]">Closed AI</span>
              </Link>
              <DemoLogoutButton />
            </div>
            <div className="mt-12 grid gap-4">
              <p className="font-cta text-sm font-bold uppercase leading-[1.1] tracking-[0.7px]">Candidate portal</p>
              <h1 className="font-display text-5xl font-light leading-[1.08] tracking-[-0.96px] sm:text-6xl">
                Browse jobs and apply with confidence.
              </h1>
              <p className="max-w-[70ch] text-lg leading-[1.6] tracking-[0.18px] text-[var(--muted)]">
                Select a job listing, submit your resume, and track statuses like Submitted, Under Review, and Ready for Screening.
              </p>
            </div>
          </div>

          <form className="grid gap-3 rounded-3xl bg-[var(--warm-stone)] p-5 shadow-[var(--shadow-warm)]" onSubmit={handleResumeSubmit}>
            <p className="text-sm font-medium text-[var(--ink)]">Signed in as {email}</p>
            <label className="text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]" htmlFor="job-select">
              Select job
            </label>
            <select
              className="min-h-11 rounded-2xl bg-[var(--surface)] px-4 text-sm shadow-[var(--shadow-outline)]"
              id="job-select"
              onChange={(event) => setSelectedJobId(event.target.value)}
              value={selectedJobId}
            >
              {jobs.map((entry) => (
                <option key={entry.job.id} value={entry.job.id}>
                  {entry.job.title}
                </option>
              ))}
            </select>
            <label className="text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]" htmlFor="resume-upload">
              Resume file (PDF or TXT)
            </label>
            <input
              accept=".pdf,.txt,application/pdf,text/plain"
              className="min-h-11 rounded-2xl bg-[var(--surface)] px-4 py-2 text-sm shadow-[var(--shadow-outline)]"
              id="resume-upload"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                setUploadState("idle");
                setError(null);
              }}
              type="file"
            />
            <button
              className="min-h-11 rounded-full bg-[var(--ink)] px-4 text-[15px] font-medium leading-[1.47] text-[var(--surface)] shadow-[var(--shadow-card)] transition hover:bg-[var(--muted)] disabled:opacity-70"
              disabled={uploadState === "uploading" || jobs.length === 0}
              type="submit"
            >
              {uploadState === "uploading" ? "Submitting resume" : "Submit resume"}
            </button>
            {uploadState === "success" ? (
              <p className="text-sm text-[var(--green)]">Resume submitted successfully.</p>
            ) : null}
          </form>
        </section>

        <section className="grid content-start gap-4 rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)]">
          {error ? (
            <article className="rounded-3xl bg-[var(--rose-soft)] p-6 shadow-[var(--shadow-outline)]">
              <p className="text-sm text-[var(--rose)]">{error}</p>
            </article>
          ) : null}

          <article className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow-outline)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-3xl font-light leading-[1.13]">Application status</h2>
              <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 text-[13px] font-medium text-[var(--green)]">
                {status ? toLabel(status.status) : "Awaiting submission"}
              </span>
            </div>
            {isLoading ? (
              <p className="mt-4 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">Loading your status...</p>
            ) : status ? (
              <>
                <p className="mt-4 text-sm text-[var(--quiet)]">Current status: {toLabel(status.status)}</p>
                {status.aiAnalysisFailed ? (
                  <p className="mt-2 text-sm text-[var(--rose)]">
                    AI analysis could not complete. Your application is under manual recruiter review.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
                Select a job and submit a resume to start your application.
              </p>
            )}
          </article>

          <article className="rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)]">
            <h3 className="text-base font-medium text-[var(--ink)]">Open jobs</h3>
            {jobs.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted)]">No jobs available yet. Recruiter will post openings soon.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {jobs.map((entry) => (
                  <li className="rounded-2xl bg-[var(--surface-soft)] px-3 py-3" key={entry.job.id}>
                    <p className="text-sm font-medium text-[var(--ink)]">{entry.job.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {entry.applicationStatus ? `Status: ${toLabel(entry.applicationStatus)}` : "Not submitted"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <ol className="grid gap-3">
            {timeline.length > 0 ? (
              timeline.map((entry) => (
                <li className="rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)]" key={entry.id}>
                  <p className="text-base font-medium leading-[1.5] tracking-[0.16px]">{entry.label}</p>
                  <p className="mt-2 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">{entry.detail}</p>
                </li>
              ))
            ) : (
              <li className="rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)]">
                <p className="text-base font-medium leading-[1.5] tracking-[0.16px]">No timeline events yet</p>
                <p className="mt-2 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
                  After your first resume upload, we will show each application step here.
                </p>
              </li>
            )}
          </ol>
        </section>
      </div>
    </main>
  );
}
