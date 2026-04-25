import {
  AutoSubscribe,
  type JobContext,
  type JobProcess,
  ServerOptions,
  cli,
  defineAgent,
  llm,
  voice,
} from "@livekit/agents";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as elevenlabs from "@livekit/agents-plugin-elevenlabs";
import * as openai from "@livekit/agents-plugin-openai";
import * as silero from "@livekit/agents-plugin-silero";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config();

// ── Metadata shape passed via agent dispatch ────────────────────────────
interface ScreeningMetadata {
  candidateName: string;
  candidateEmail: string;
  roleApplied: string;
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  fitScore?: number;
  strengths?: string[];
  risks?: string[];
}

// ── Build the interviewer system prompt ─────────────────────────────────
function buildInterviewerInstructions(meta: ScreeningMetadata): string {
  return [
    `You are a first-round AI screening interviewer at closedAI, a modern HR technology company.`,
    `Your name is closedAI. You are calm, professional, methodical, and composed.`,
    ``,
    `## Candidate Profile`,
    `- Name: ${meta.candidateName}`,
    `- Role Applied For: ${meta.roleApplied}`,
    meta.fitScore !== undefined
      ? `- Preliminary Fit Score: ${meta.fitScore}/100`
      : "",
    meta.strengths?.length
      ? `- Noted Strengths: ${meta.strengths.join(", ")}`
      : "",
    meta.risks?.length ? `- Areas to Probe: ${meta.risks.join(", ")}` : "",
    ``,
    `## Demo Interview Rules`,
    `1. This is a demo call. Ask exactly ONE interview question total.`,
    `2. Keep every turn short (max 1-2 sentences) and conversational.`,
    `3. After the candidate answers the one question, acknowledge briefly and close the call politely.`,
    `4. Do NOT ask any follow-up or second question.`,
    `5. Do NOT share fit scores, hiring decisions, or internal evaluations.`,
    `6. If asked about salary/timeline, say the recruiting team will follow up.`,
    ``,
    `## Demo Flow`,
    `1. Give a very short greeting.`,
    `2. Ask one role-relevant question about a recent project or challenge.`,
    `3. After one answer, thank the candidate and close.`,
    ``,
    `## Tone`,
    `- Sound like a real person conducting a real phone screen.`,
    `- Be warm but not overly friendly. Professional but not robotic.`,
    `- Use natural conversational language. Avoid stiff corporate phrases.`,
    `- Speak concisely — remember this is voice, not text.`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Build initial chat context with resume + JD ─────────────────────────
function buildInitialChatContext(meta: ScreeningMetadata): llm.ChatContext {
  const chatCtx = new llm.ChatContext();

  // Inject the resume and JD as assistant-side context so the LLM is aware
  // but the candidate doesn't hear this read aloud.
  chatCtx.addMessage({
    role: "assistant",
    content: [
      `[INTERNAL CONTEXT — DO NOT READ ALOUD]`,
      ``,
      `## Job Description: ${meta.jobTitle}`,
      meta.jobDescription,
      ``,
      `## Candidate Resume (${meta.candidateName})`,
      meta.resumeText,
    ].join("\n"),
  });

  return chatCtx;
}

// ── Parse metadata from the job context ─────────────────────────────────
function parseMetadata(raw: string | undefined): ScreeningMetadata | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ScreeningMetadata;
    if (!parsed.candidateName || !parsed.roleApplied) return null;
    return parsed;
  } catch {
    console.warn("[closedai-agent] failed to parse job metadata:", raw);
    return null;
  }
}

// ── Fallback metadata for testing without dispatch ──────────────────────
const FALLBACK_META: ScreeningMetadata = {
  candidateName: "Candidate",
  candidateEmail: "unknown@test.com",
  roleApplied: "Software Engineer",
  jobTitle: "Software Engineer",
  jobDescription:
    "We are looking for a software engineer with strong problem-solving skills.",
  resumeText: "No resume provided.",
};

// ── Agent definition ────────────────────────────────────────────────────

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx: JobContext) => {
    const vad = ctx.proc.userData.vad as silero.VAD;

    // Parse candidate context from dispatch metadata
    const meta = parseMetadata(ctx.job.metadata) ?? FALLBACK_META;

    console.info("[closedai-agent] starting screening interview", {
      candidate: meta.candidateName,
      role: meta.roleApplied,
      hasResume: meta.resumeText !== "No resume provided.",
    });

    // Build the interviewer agent with full context
    const instructions = buildInterviewerInstructions(meta);
    const chatCtx = buildInitialChatContext(meta);

    const agent = new voice.Agent({
      instructions,
      chatCtx,
    });

    const session = new voice.AgentSession({
      vad,
      stt: new deepgram.STT({
        model: "nova-3",
        language: "en",
      }),
      llm: new openai.LLM({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      }),
      tts: new elevenlabs.TTS({
        // Keep model unset to use the SDK/provider default and avoid
        // model-specific incompatibilities across ElevenLabs accounts.
        voiceId: "EXAVITQu4vr4xnSDxMaL",
      }),
      turnHandling: {
        interruption: { mode: "vad" },
        preemptiveGeneration: { enabled: true },
      },
    });

    await ctx.connect(undefined, AutoSubscribe.AUDIO_ONLY);
    await session.start({
      room: ctx.room,
      agent,
    });

    // CRITICAL: Wait for the candidate to actually be in the room before speaking.
    // Otherwise TTS audio is pushed into an empty room and gets dropped from the
    // realtime audio buffer (default 1000ms), so the candidate joins and hears silence.
    console.info("[closedai-agent] waiting for candidate participant to join the room");
    const participant = await ctx.waitForParticipant();
    console.info("[closedai-agent] candidate joined, starting greeting", {
      identity: participant.identity,
    });

    // Demo greeting is intentionally short and non-interruptible.
    const firstName = meta.candidateName.split(" ")[0] ?? meta.candidateName;
    await session.generateReply({
      instructions: `Give a short greeting to ${firstName}, introduce yourself as closedAI, and immediately ask exactly one interview question for the ${meta.roleApplied} role. Keep the full greeting plus question under two sentences.`,
      allowInterruptions: false,
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "closedai-screening",
  }),
);
