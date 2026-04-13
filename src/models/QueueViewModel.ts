import type { LiveChatParticipantRole } from "./LiveChatModel";

export type QueueAssignmentMode = "auto" | "manual";

export interface QueueAgentOption {
  id: string;
  name: string;
  status: "online" | "away";
  activeChats: number;
}

export interface QueueVisitorRow {
  id: string;
  conversationId: string;
  sessionId?: string;
  visitorId?: string | null;
  name: string;
  message: string;
  status: "Waiting" | "Assigned";
  queuedAt?: string | null;
  assignedAt?: string | null;
  agentId?: string | null;
  agentName?: string;
  ipAddress?: string;
  location?: string;
  country?: string;
  browser?: string;
  device?: string;
  deviceType?: string;
  os?: string;
  referrer?: string;
  currentPage?: string;
  visits?: number;
  language?: string;
}

export interface QueueVisitorDialogMessage {
  id: string;
  senderType: LiveChatParticipantRole;
  message: string;
  createdAt?: string;
}
