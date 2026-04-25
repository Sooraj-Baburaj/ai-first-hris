import { AccessToken } from "livekit-server-sdk";

import { env } from "../../config/env.js";
import { AppError } from "../../lib/app-error.js";

export const livekitTokenService = {
  async createCandidateJoinToken(input: {
    roomName: string;
    participantName: string;
    participantIdentity: string;
  }) {
    if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
      throw new AppError(
        "LiveKit credentials are missing. Configure LIVEKIT_API_KEY and LIVEKIT_API_SECRET.",
        500,
        "LIVEKIT_NOT_CONFIGURED"
      );
    }

    const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity: input.participantIdentity,
      name: input.participantName,
      ttl: "20m",
    });

    token.addGrant({
      roomJoin: true,
      room: input.roomName,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    return token.toJwt();
  },

  async dispatchScreeningAgent(input: { roomName: string; metadata: any }) {
    if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
       throw new AppError(
        "LiveKit credentials are missing.",
        500,
        "LIVEKIT_NOT_CONFIGURED"
      );
    }
    
    // Fallback URL if env is not completely setup with wss
    const wsUrl = env.LIVEKIT_URL ?? "ws://localhost:7880";
    // For dispatch, we need the HTTP URL
    const httpUrl = wsUrl.replace("wss://", "https://").replace("ws://", "http://");

    const { AgentDispatchClient } = await import("livekit-server-sdk");
    const dispatchClient = new AgentDispatchClient(
      httpUrl,
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET
    );

    try {
      await dispatchClient.createDispatch(input.roomName, "closedai-screening", {
        metadata: JSON.stringify(input.metadata),
      });
      console.info(`[livekit-token.service] Explicitly dispatched agent to ${input.roomName}`);
    } catch (error) {
      console.error("[livekit-token.service] Failed to dispatch agent:", error);
      // We don't throw here because we also fall back to token-based dispatch
    }
  },
};
