"use client";

import { apiBaseUrl } from "@/app/lib/api";
import type {
  CandidateJoinScreeningResponseDto,
  CandidateScreeningInviteResponseDto,
} from "@closed-ai/types";
import {
  type LocalAudioTrack,
  ParticipantKind,
  type RemoteAudioTrack,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  createLocalAudioTrack,
} from "livekit-client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  inviteId: string;
};

type RemoteAudioEntry = {
  sid: string;
  track: RemoteAudioTrack;
  participantIdentity: string;
};

type AgentStatus = "waiting" | "connecting" | "listening" | "speaking";

export function ScreeningVoiceSession({ inviteId }: Props) {
  const [invite, setInvite] = useState<CandidateScreeningInviteResponseDto["invite"] | null>(null);
  const [joinPayload, setJoinPayload] = useState<CandidateJoinScreeningResponseDto | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("waiting");
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<RemoteAudioEntry | null>(null);

  const roomRef = useRef<Room | null>(null);
  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null);
  const hasCompletedRef = useRef(false);
  const elapsedSecondsRef = useRef(0);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  const connectionLabel = useMemo(() => {
    if (isConnecting) {
      return "Connecting";
    }
    if (isConnected) {
      return "Stable";
    }
    return "Offline";
  }, [isConnected, isConnecting]);

  useEffect(() => {
    let cancelled = false;
    async function loadInvite() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/candidate/screening/${inviteId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Invite not found");
        }
        const payload = (await response.json()) as CandidateScreeningInviteResponseDto;
        if (!cancelled) {
          setInvite(payload.invite);
        }
      } catch {
        if (!cancelled) {
          setError("This invitation is unavailable or expired.");
        }
      }
    }
    void loadInvite();
    return () => {
      cancelled = true;
    };
  }, [inviteId]);

  useEffect(() => {
    if (!startedAt || !isConnected) {
      return;
    }
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [isConnected, startedAt]);

  const elapsed = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (elapsedSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, [elapsedSeconds]);

  const completeScreeningIfNeeded = useCallback(async () => {
    if (hasCompletedRef.current) {
      return;
    }
    if (elapsedSecondsRef.current < 5) {
      return;
    }
    hasCompletedRef.current = true;
    try {
      await fetch(`${apiBaseUrl}/api/v1/candidate/screening/${inviteId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ durationSeconds: elapsedSecondsRef.current }),
      });
    } catch (completionError) {
      console.warn("[screening-session] failed to submit screening completion", {
        reason: completionError instanceof Error ? completionError.message : "unknown",
      });
    }
  }, [inviteId]);

  const teardownRoom = useCallback(() => {
    const currentRoom = roomRef.current;
    setRemoteAudioTrack(null);
    setIsConnected(false);
    setIsConnecting(false);
    setStartedAt(null);
    setElapsedSeconds(0);
    setAgentStatus("waiting");
    setAudioBlocked(false);
    setJoinPayload(null);
    if (localAudioTrackRef.current) {
      try {
        localAudioTrackRef.current.stop();
      } catch {
        /* no-op */
      }
      localAudioTrackRef.current = null;
    }
    if (currentRoom) {
      try {
        currentRoom.disconnect();
      } catch {
        /* no-op */
      }
    }
    roomRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      teardownRoom();
    };
  }, [teardownRoom]);

  const detectAudioPlaybackBlocked = useCallback((room: Room) => {
    setAudioBlocked(!room.canPlaybackAudio);
  }, []);

  async function joinCall() {
    setError(null);
    setIsConnecting(true);
    hasCompletedRef.current = false;

    let nextRoom: Room | null = null;
    let localTrack: LocalAudioTrack | null = null;

    try {
      // 1. Acquire mic FIRST (this unlocks audio playback for the page in
      //    most browsers because getUserMedia is itself a user activation).
      try {
        localTrack = await createLocalAudioTrack({
          echoCancellation: true,
          noiseSuppression: true,
        });
        localAudioTrackRef.current = localTrack;
      } catch (micError) {
        console.warn("[screening-session] mic access denied", {
          reason: micError instanceof Error ? micError.message : "unknown",
        });
        setError("Microphone access is required. Allow mic permission and rejoin.");
        setIsConnecting(false);
        return;
      }

      // 2. Get the join token from the backend.
      const response = await fetch(`${apiBaseUrl}/api/v1/candidate/screening/${inviteId}/join`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Join failed");
      }
      const payload = (await response.json()) as CandidateJoinScreeningResponseDto;

      // 3. Create the Room and attach event listeners BEFORE connecting so we
      //    don't miss any TrackSubscribed events that fire during connect().
      nextRoom = new Room({
        adaptiveStream: false,
        dynacast: false,
      });
      roomRef.current = nextRoom;
      setAgentStatus("connecting");

      const onTrackSubscribed = (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        if (track.kind !== Track.Kind.Audio) {
          return;
        }
        const isAgent =
          participant.kind === ParticipantKind.AGENT ||
          participant.identity.toLowerCase().includes("agent") ||
          participant.identity.toLowerCase().includes("closedai");
        if (!isAgent) {
          return;
        }
        console.info("[screening-session] remote audio subscribed", {
          participant: participant.identity,
          sid: publication.trackSid,
        });
        const audioTrack = track as RemoteAudioTrack;
        setRemoteAudioTrack({
          sid: publication.trackSid,
          track: audioTrack,
          participantIdentity: participant.identity,
        });
        setAgentStatus("listening");
        // Track subscription often occurs after connect() settles; ask LiveKit
        // to resume audio again at this exact moment.
        if (nextRoom) {
          void nextRoom.startAudio().catch((error) => {
            console.warn("[screening-session] startAudio on track subscribe rejected", {
              reason: error instanceof Error ? error.message : "unknown",
            });
          });
        }
      };

      const onTrackUnsubscribed = (
        track: RemoteTrack,
        publication: RemoteTrackPublication
      ) => {
        if (track.kind !== Track.Kind.Audio) {
          return;
        }
        setRemoteAudioTrack((prev) => (prev?.sid === publication.trackSid ? null : prev));
      };

      const onParticipantConnected = (participant: RemoteParticipant) => {
        console.info("[screening-session] participant connected", {
          identity: participant.identity,
          kind: participant.kind,
        });
        const isAgent =
          participant.kind === ParticipantKind.AGENT ||
          participant.identity.toLowerCase().includes("agent") ||
          participant.identity.toLowerCase().includes("closedai");
        if (isAgent) {
          setAgentStatus("listening");
        }
      };

      const onActiveSpeakers = (speakers: RemoteParticipant[] | unknown[]) => {
        const remoteSpeaker = (speakers as RemoteParticipant[]).find(
          (speaker) => !("isLocal" in speaker) || !speaker.isLocal
        );
        if (remoteSpeaker) {
          setAgentStatus("speaking");
        } else if (nextRoom && nextRoom.remoteParticipants.size > 0) {
          setAgentStatus("listening");
        }
      };

      const onAudioPlaybackChanged = () => {
        if (nextRoom) {
          detectAudioPlaybackBlocked(nextRoom);
        }
      };

      const onDisconnected = () => {
        console.info("[screening-session] room disconnected");
        void completeScreeningIfNeeded();
        setIsConnected(false);
        setIsConnecting(false);
        setAgentStatus("waiting");
        setRemoteAudioTrack(null);
      };

      nextRoom.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
      nextRoom.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      nextRoom.on(RoomEvent.ParticipantConnected, onParticipantConnected);
      nextRoom.on(RoomEvent.ActiveSpeakersChanged, onActiveSpeakers);
      nextRoom.on(RoomEvent.AudioPlaybackStatusChanged, onAudioPlaybackChanged);
      nextRoom.on(RoomEvent.Disconnected, onDisconnected);

      // 4. Connect to the room.
      await nextRoom.connect(payload.livekitUrl, payload.token);
      console.info("[screening-session] room connected", {
        url: payload.livekitUrl,
        room: payload.roomName,
      });

      // 5. Try to start audio playback. This needs to happen close to the
      //    user gesture so the browser permits AudioContext.resume().
      try {
        await nextRoom.startAudio();
        console.info("[screening-session] startAudio resolved", {
          canPlaybackAudio: nextRoom.canPlaybackAudio,
        });
      } catch (startAudioError) {
        console.warn("[screening-session] startAudio rejected", {
          reason:
            startAudioError instanceof Error ? startAudioError.message : "unknown",
        });
      }
      detectAudioPlaybackBlocked(nextRoom);

      // 6. Surface any tracks already subscribed before listeners attached.
      nextRoom.remoteParticipants.forEach((participant) => {
        participant.audioTrackPublications.forEach((publication) => {
          if (publication.track && publication.isSubscribed) {
            onTrackSubscribed(publication.track, publication, participant);
          }
        });
      });

      // 7. Publish our microphone so the agent can hear us.
      try {
        await nextRoom.localParticipant.publishTrack(localTrack);
      } catch (publishError) {
        console.warn("[screening-session] publish mic failed", {
          reason: publishError instanceof Error ? publishError.message : "unknown",
        });
        setError("Connected, but mic publish failed. Try rejoining.");
      }

      setJoinPayload(payload);
      setIsConnected(true);
      setStartedAt(Date.now());
      setElapsedSeconds(0);
      setIsConnecting(false);
    } catch (joinError) {
      console.warn("[screening-session] join failed", {
        reason: joinError instanceof Error ? joinError.message : "unknown",
      });
      setError("Could not join the screening session. Please retry.");
      if (localTrack) {
        try {
          localTrack.stop();
        } catch {
          /* no-op */
        }
        localAudioTrackRef.current = null;
      }
      if (nextRoom) {
        try {
          nextRoom.disconnect();
        } catch {
          /* no-op */
        }
      }
      roomRef.current = null;
      setIsConnected(false);
      setJoinPayload(null);
      setAgentStatus("waiting");
      setRemoteAudioTrack(null);
      setIsConnecting(false);
    }
  }

  async function unlockAudio() {
    const targetRoom = roomRef.current;
    if (!targetRoom) {
      return;
    }
    try {
      await targetRoom.startAudio();
    } catch (unlockError) {
      console.warn("[screening-session] manual audio unlock failed", {
        reason: unlockError instanceof Error ? unlockError.message : "unknown",
      });
    }
    detectAudioPlaybackBlocked(targetRoom);
  }

  async function toggleMute() {
    const currentRoom = roomRef.current;
    if (!currentRoom?.localParticipant) {
      return;
    }
    const publication = Array.from(currentRoom.localParticipant.audioTrackPublications.values())[0];
    if (!publication?.track) {
      return;
    }
    if (isMuted) {
      await publication.track.unmute();
      setIsMuted(false);
    } else {
      await publication.track.mute();
      setIsMuted(true);
    }
  }

  async function leaveCall() {
    await completeScreeningIfNeeded();
    teardownRoom();
  }

  const statusLabel =
    agentStatus === "speaking"
      ? "Speaking..."
      : agentStatus === "listening"
        ? "Listening..."
        : agentStatus === "connecting"
          ? "Connecting..."
          : "Waiting for you to join";

  return (
    <main className="h-dvh overflow-hidden bg-(--background) p-3 text-(--ink) sm:p-4">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col rounded-[28px] bg-(--surface) p-5 shadow-(--shadow-outline) sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm text-(--muted) transition-colors hover:text-(--ink)" href="/candidate">
            Back to candidate portal
          </Link>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="rounded-full bg-(--surface-soft) px-3 py-1.5 text-(--muted)">
              {elapsed}
            </span>
            <span className="rounded-full bg-(--surface-soft) px-3 py-1.5 text-(--muted)">
              {connectionLabel}
            </span>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-2 py-4 text-center sm:py-6">
          <div
            aria-hidden
            className={`relative size-44 rounded-full bg-(--primary-quiet) shadow-(--shadow-warm) sm:size-56 ${
              isConnected ? "animate-[orb-breathe_3.8s_ease-in-out_infinite]" : ""
            }`}
          >
            <span className="absolute inset-4 rounded-full bg-(--surface)/80" />
            <span className="absolute inset-10 rounded-full bg-(--primary-quiet)/60" />
          </div>

          <div className="space-y-1">
            <h1 className="font-display text-5xl font-light tracking-[-0.03em] text-(--ink) sm:text-6xl">
              {joinPayload?.agentName ?? "closedAI"}
            </h1>
            <p className="text-sm tracking-[0.16px] text-(--muted) sm:text-base">{statusLabel}</p>
          </div>

          <p className="rounded-full bg-(--surface-soft) px-4 py-2 text-xs tracking-[0.14px] text-(--muted) sm:text-sm">
            Candidate: {invite?.fullName ?? "—"} | Role: {invite?.roleApplied ?? "—"} | Duration: 30 mins
          </p>

          {audioBlocked && isConnected ? (
            <button
              className="min-h-11 rounded-full bg-(--ink) px-5 text-sm font-medium text-(--surface) shadow-(--shadow-card)"
              onClick={() => void unlockAudio()}
              type="button"
            >
              Tap to enable audio
            </button>
          ) : null}

          {error ? <p className="max-w-xl text-sm text-(--rose)">{error}</p> : null}
        </section>

        <footer className="mt-auto flex flex-wrap items-center justify-center gap-3 pb-2">
          {!isConnected ? (
            <button
              className="min-h-11 rounded-full bg-(--ink) px-6 text-sm font-medium text-(--surface) shadow-(--shadow-card) transition-opacity disabled:opacity-65"
              disabled={isConnecting || !invite}
              onClick={() => void joinCall()}
              type="button"
            >
              {isConnecting ? "Joining..." : "Join screening"}
            </button>
          ) : (
            <>
              <button
                className="min-h-11 rounded-full bg-(--surface-soft) px-5 text-sm font-medium text-(--ink) shadow-(--shadow-inset)"
                onClick={() => void toggleMute()}
                type="button"
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                className="min-h-11 rounded-full bg-(--rose) px-5 text-sm font-medium text-(--surface)"
                onClick={() => void leaveCall()}
                type="button"
              >
                End call
              </button>
            </>
          )}
        </footer>
      </div>

      {/* Render one <audio> element per subscribed remote audio track. The
       *  callback ref attaches the LiveKit track to the actual element so
       *  audio plays through this concrete DOM node. Kept hidden visually
       *  but always present in the DOM so the browser will play it. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -9999,
          top: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {remoteAudioTrack ? (
          <RemoteAudioPlayer
            key={remoteAudioTrack.sid}
            entry={remoteAudioTrack}
            onPlaybackBlocked={() => setAudioBlocked(true)}
            onPlaybackResumed={() => setAudioBlocked(false)}
          />
        ) : null}
      </div>

      <style jsx>{`
        @keyframes orb-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}

type RemoteAudioPlayerProps = {
  entry: RemoteAudioEntry;
  onPlaybackBlocked: () => void;
  onPlaybackResumed: () => void;
};

function RemoteAudioPlayer({ entry, onPlaybackBlocked, onPlaybackResumed }: RemoteAudioPlayerProps) {
  const elementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioEl = elementRef.current;
    if (!audioEl) {
      return;
    }
    try {
      entry.track.attach(audioEl);
    } catch (attachError) {
      console.warn("[screening-session] track.attach failed", {
        reason: attachError instanceof Error ? attachError.message : "unknown",
      });
    }
    audioEl.muted = false;
    audioEl.volume = 1;
    audioEl.setAttribute("playsinline", "true");
    let cancelled = false;

    const tryPlay = async (attempt: number) => {
      if (cancelled) {
        return;
      }
      try {
        await audioEl.play();
        if (!cancelled) {
          console.info("[screening-session] audio element playing", { sid: entry.sid, attempt });
          onPlaybackResumed();
        }
      } catch (playError: unknown) {
        const errorName = playError instanceof Error ? playError.name : "unknown";
        const errorMessage = playError instanceof Error ? playError.message : "unknown";
        const lowerMessage = errorMessage.toLowerCase();
        const interruptedByReload =
          errorName === "AbortError" ||
          lowerMessage.includes("interrupted by a new load request");
        const autoplayBlocked =
          errorName === "NotAllowedError" || lowerMessage.includes("notallowederror");

        // In dev/strict-mode and during track renegotiation, the element can
        // transiently reject play() while its source is being re-bound.
        if (interruptedByReload && attempt < 4) {
          window.setTimeout(() => {
            void tryPlay(attempt + 1);
          }, 120 * attempt);
          return;
        }

        console.warn("[screening-session] audio element play() rejected", {
          sid: entry.sid,
          attempt,
          reason: errorMessage,
          name: errorName,
        });

        if (autoplayBlocked) {
          onPlaybackBlocked();
          return;
        }

        // If repeated source-reload interruptions exhaust retries, surface
        // the manual unlock path instead of failing silently.
        if (interruptedByReload) {
          onPlaybackBlocked();
        }
      }
    };

    void tryPlay(1);
    return () => {
      cancelled = true;
      try {
        entry.track.detach(audioEl);
      } catch {
        /* no-op */
      }
    };
  }, [entry, onPlaybackBlocked, onPlaybackResumed]);

  return (
    <audio
      ref={elementRef}
      autoPlay
      controls={false}
      data-track-sid={entry.sid}
    />
  );
}
