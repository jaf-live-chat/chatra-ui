import type {
  LiveChatConversation,
  LiveChatMessage,
  LiveChatPagination,
  LiveChatVisitor,
} from "./LiveChatModel";

export interface PortalVisitor extends LiveChatVisitor {
  displayName: string;
  conversationCount: number;
  lastConversationAt: string | null;
}

export interface VisitorConversationHistorySummary {
  messageCount: number;
  firstMessage: string;
  lastMessage: string;
  lastMessageAt: string | null;
}

export interface VisitorConversationHistory extends LiveChatConversation {
  history: VisitorConversationHistorySummary;
}

export interface GetVisitorsResponse {
  success: boolean;
  visitors: PortalVisitor[];
  pagination: LiveChatPagination;
}

export interface GetVisitorsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetVisitorDetailsParams {
  page?: number;
  limit?: number;
}

export interface GetVisitorDetailsResponse {
  success: boolean;
  visitor: PortalVisitor;
  conversations: VisitorConversationHistory[];
  pagination: LiveChatPagination;
}

export interface ConversationMessagesDialogState {
  conversationId: string;
  title: string;
}

export interface VisitorConversationMessageList {
  success: boolean;
  messages: LiveChatMessage[];
  pagination: LiveChatPagination;
}
