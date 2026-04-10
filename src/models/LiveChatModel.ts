export type LiveChatAssignmentMode = "MANUAL" | "ROUND_ROBIN";
export type LiveChatConversationStatus = "WAITING" | "OPEN" | "ENDED";
export type LiveChatQueueStatus = "WAITING" | "ASSIGNED";
export type LiveChatParticipantRole = "MASTER_ADMIN" | "ADMIN" | "SUPPORT_AGENT" | "VISITOR";

export interface LiveChatPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LiveChatVisitor {
  _id: string;
  visitorToken?: string | null;
  name?: string | null;
  emailAddress?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  lastSeenAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveChatAgent {
  _id: string;
  fullName: string;
  emailAddress: string;
  role: LiveChatParticipantRole;
  status?: string;
  profilePicture?: string | null;
}

export interface LiveChatConversation {
  _id: string;
  visitorId: string | LiveChatVisitor;
  agentId: string | LiveChatAgent | null;
  visitorToken?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: LiveChatConversationStatus;
  queuedAt?: string | null;
  assignedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveChatQueueEntry {
  _id: string;
  conversationId: string | LiveChatConversation;
  visitorId: string | LiveChatVisitor;
  agentId: string | LiveChatAgent | null;
  status: LiveChatQueueStatus;
  assignmentMode: LiveChatAssignmentMode;
  queuedAt?: string | null;
  assignedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveChatMessage {
  _id: string;
  conversationId: string;
  senderType: LiveChatParticipantRole;
  senderId: string | LiveChatVisitor | LiveChatAgent;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetLiveChatQueueResponse {
  success: boolean;
  queue: LiveChatQueueEntry[];
  pagination: LiveChatPagination;
}

export interface GetLiveChatMessagesResponse {
  success: boolean;
  messages: LiveChatMessage[];
  pagination: LiveChatPagination;
}

export interface GetLiveChatQueueParams {
  page?: number;
  limit?: number;
}

export interface GetConversationMessagesParams {
  page?: number;
  limit?: number;
}

export interface LiveChatStartConversationResponse {
  success: boolean;
  message?: string;
  conversation: LiveChatConversation;
  queueEntry: LiveChatQueueEntry | null;
  visitor: LiveChatVisitor;
  agent: LiveChatAgent | null;
  initialMessage: LiveChatMessage | null;
}

export interface LiveChatSendMessagePayload {
  conversationId: string;
  message: string;
}

export interface LiveChatWidgetConfig {
  apiKey?: string;
  title?: string;
  welcomeMessage?: string;
  widgetLogo?: string;
  accentColor?: string;
}

export interface LiveChatWidgetQuickMessage {
  _id: string;
  title: string;
  response: string;
}

export interface GetWidgetQuickMessagesResponse {
  success: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  quickMessages: LiveChatWidgetQuickMessage[];
}

export interface WidgetSettingsRecord {
  _id?: string;
  widgetLogo?: string;
  widgetTitle: string;
  welcomeMessage: string;
  accentColor: string;
}

export interface GetWidgetSettingsResponse {
  success: boolean;
  widgetSettings: WidgetSettingsRecord;
}