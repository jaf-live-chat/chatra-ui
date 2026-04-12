import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "../constants/constants";

type LiveChatSocketQuery = {
  apiKey?: string;
  databaseName?: string;
  tenantId?: string;
  role?: string;
  agentId?: string;
  visitorToken?: string;
  conversationId?: string;
};

const resolveRealtimeBaseUrl = () => {
  const apiBaseUrl = String(API_BASE_URL).trim().replace(/\/$/, "");
  const rootUrl = apiBaseUrl.replace(/\/api\/v\d+\/?$/i, "");

  if (rootUrl.startsWith("https://") || rootUrl.startsWith("http://")) {
    return rootUrl;
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }

  return "";
};

const createLiveChatSocket = (query: LiveChatSocketQuery): Socket | null => {
  const baseUrl = resolveRealtimeBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return io(baseUrl, {
    path: "/ws/live-chat",
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 800,
    query,
  });
};

export { createLiveChatSocket, resolveRealtimeBaseUrl };
