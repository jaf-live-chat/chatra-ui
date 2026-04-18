import type { LiveChatMessage } from "./LiveChatModel";

export type SubTab = "active-chats" | "chat-history";

export interface AttachedFile {
  name: string;
  url: string;
  type: string;
}

export interface ChatMessage {
  id: string;
  sender: "visitor" | "agent";
  text: string;
  timestamp: string;
  files?: AttachedFile[];
  status?: "SENDING" | "DELIVERED" | "SEEN";
  seenAt?: string | null;
  seenByRole?: string | null;
}

export interface ActiveChat {
  id: string;
  visitor: string;
  visitorFullName?: string;
  visitorAvatarUrl?: string;
  sessionId?: string;
  message: string;
  status: string;
  timeInQueue?: string;
  messages: ChatMessage[];
  startedAt: number;
  agent: string;
  agentFullName?: string;
  agentAvatarUrl?: string;
  location?: string;
  country?: string;
  locationConsent?: boolean;
  ipAddress?: string;
  currentPage?: string;
  referrer?: string;
  browser?: string;
  os?: string;
  device?: string;
}

export interface HistoryEntry {
  id: string;
  visitor: string;
  visitorFullName?: string;
  visitorAvatarUrl?: string;
  agent: string;
  agentFullName?: string;
  agentAvatarUrl?: string;
  duration: string;
  messages: number;
  rating?: number | null;
  ratingComment?: string | null;
  ratedAt?: string | null;
  date: string;
  time: string;
  status: "Resolved" | "Escalated" | "Abandoned";
  tags: string[];
  isLive?: boolean;
  queueDisplayId?: string;
}

export interface QuickReplyItem {
  id: string;
  shortcut: string;
  title: string;
  message: string;
  category: string;
}

export interface TranscriptMessage {
  sender: "visitor" | "agent";
  text: string;
  time: string;
}

export interface SelectedVisitorStorage {
  sessionId?: string;
  conversationId?: string;
  id?: string;
}

export interface ChatAttachmentUpload {
  file: File;
  previewUrl: string;
}

export type ChatHistoryTranscriptMap = Record<string, TranscriptMessage[]>;

export const mapServerMessageToChatMessage = (
  message: LiveChatMessage,
  fallbackId: string,
  fallbackTimestamp: string,
): ChatMessage => ({
  id: message._id || fallbackId,
  sender: message.senderType === "VISITOR" ? "visitor" : "agent",
  text: String(message.message || ""),
  timestamp: message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : fallbackTimestamp,
  status: message.status as "SENDING" | "DELIVERED" | "SEEN" | undefined,
  seenAt: message.seenAt || null,
  seenByRole: message.seenByRole || null,
});
