"use client";

import { apiBaseUrl } from "@/app/lib/api";
import type { JobDto } from "@closed-ai/types";
import { useState } from "react";

export function RecruiterJobsBoard({ initialJobs }: { initialJobs: JobDto[] }) {
  const [jobs, setJobs] = useState<JobDto[]>(initialJobs);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/recruiter/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error("Could not create job");
      }

      const payload = (await response.json()) as { job: JobDto };
      setJobs((previous) => [payload.job, ...previous]);
      setTitle("");
      setDescription("");
    } catch {
      setError("Could not create job right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)]">
      <form
        className="grid gap-4 rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)]"
        onSubmit={handleCreateJob}
      >
        <h2 className="font-display text-3xl font-light leading-[1.13] text-[var(--ink)]">
          Create a job listing
        </h2>
        <input
          className="min-h-11 rounded-2xl bg-[var(--surface)] px-4 text-sm shadow-[var(--shadow-outline)]"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Job title"
          required
          type="text"
          value={title}
        />
        <textarea
          className="min-h-28 rounded-2xl bg-[var(--surface)] px-4 py-3 text-sm shadow-[var(--shadow-outline)]"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Job description"
          required
          value={description}
        />
        <button
          className="min-h-11 rounded-full bg-[var(--ink)] px-4 text-[15px] font-medium leading-[1.47] text-[var(--surface)] shadow-[var(--shadow-card)] transition hover:bg-[var(--muted)] disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating job" : "Create job"}
        </button>
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      </form>

      {jobs.length === 0 ? (
        <article className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow-outline)]">
          <p className="text-base font-medium text-[var(--ink)]">No jobs listed yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add a title and description so candidates can start applying.
          </p>
        </article>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <article className="rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)]" key={job.id}>
              <h3 className="text-base font-medium text-[var(--ink)]">{job.title}</h3>
              <p className="mt-2 max-w-[70ch] text-sm text-[var(--muted)]">{job.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
