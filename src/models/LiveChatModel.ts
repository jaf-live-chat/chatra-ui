export type LiveChatAssignmentMode = "MANUAL" | "ROUND_ROBIN";
export type LiveChatConversationStatus = "WAITING" | "OPEN" | "ENDED";
export type LiveChatQueueStatus = "WAITING" | "ASSIGNED";
export type LiveChatParticipantRole = "MASTER_ADMIN" | "ADMIN" | "SUPPORT_AGENT" | "VISITOR";
export type LiveChatMessageStatus = "SENDING" | "DELIVERED" | "SEEN";

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
  fullName?: string | null;
  emailAddress?: string | null;
  phoneNumber?: string | null;
  ipAddressConsent?: boolean;
  ipAddress?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  locationSource?: string | null;
  locationConsent?: boolean;
  locationResolvedAt?: string | null;
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
  displayName?: string;
}

export interface LiveChatConversation {
  _id: string;
  visitorId: string | LiveChatVisitor;
  agentId: string | LiveChatAgent | null;
  visitorToken?: string | null;
  ipAddress?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  locationSource?: string | null;
  locationConsent?: boolean;
  locationResolvedAt?: string | null;
  status: LiveChatConversationStatus;
  queuedAt?: string | null;
  assignedAt?: string | null;
  closedAt?: string | null;
  closedByRole?: string | null;
  closedById?: string | null;
  createdAt?: string;
  updatedAt?: string;
  rating?: number | null;
  ratingComment?: string | null;
  ratedAt?: string | null;
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
  endedAt?: string | null;
  closedByRole?: string | null;
  closedById?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveChatMessage {
  _id: string;
  conversationId: string;
  senderType: LiveChatParticipantRole;
  senderId: string | LiveChatVisitor | LiveChatAgent;
  message: string;
  status?: LiveChatMessageStatus;
  seenAt?: string | null;
  seenById?: string | null;
  seenByRole?: LiveChatParticipantRole | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetLiveChatQueueResponse {
  success: boolean;
  queue: LiveChatQueueEntry[];
  pagination: LiveChatPagination;
}

export interface GetActiveLiveChatResponse {
  success: boolean;
  queue: LiveChatQueueEntry[];
  pagination: LiveChatPagination;
}

export interface GetLiveChatHistoryResponse {
  success: boolean;
  conversations: LiveChatConversation[];
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
  queuePosition?: LiveChatQueuePositionChangedEvent | null;
  location?: {
    city?: string | null;
    country?: string | null;
    source?: string | null;
    consentGranted?: boolean;
    resolvedAt?: string | null;
  };
}

export interface LiveChatEndedBy {
  role?: string | null;
  id?: string | null;
  displayName?: string | null;
  endedAt?: string | null;
}

export interface LiveChatConversationEndedEvent extends LiveChatStartConversationResponse {
  endedBy?: LiveChatEndedBy;
  timestamp?: string;
}

export interface LiveChatQueueUpdatedEvent {
  reason?: string;
  conversationId?: string;
  queueEntry?: LiveChatQueueEntry | null;
  conversation?: LiveChatConversation | null;
  timestamp?: string;
}

export interface LiveChatQueuePositionChangedEvent {
  conversationId?: string;
  position?: number;
  positionsAhead?: number;
  reason?: string;
  timestamp?: string;
}

export interface LiveChatEndConversationResponse {
  success: boolean;
  message?: string;
  conversation: LiveChatConversation;
  queueEntry: LiveChatQueueEntry | null;
  visitor: LiveChatVisitor;
  agent: LiveChatAgent | null;
  location?: {
    city?: string | null;
    country?: string | null;
    source?: string | null;
    consentGranted?: boolean;
    resolvedAt?: string | null;
  };
  endedBy?: LiveChatEndedBy;
}

export interface LiveChatConversationFeedback {
  _id: string;
  conversationId: string | LiveChatConversation;
  visitorId: string | LiveChatVisitor;
  agentId: string | LiveChatAgent;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveChatConversationFeedbackSummary {
  averageRating: number;
  ratingCount: number;
}

export interface LiveChatSubmitFeedbackPayload {
  rating: number;
  comment?: string;
}

export interface LiveChatSubmitFeedbackResponse {
  success: boolean;
  message?: string;
  feedback: LiveChatConversationFeedback;
  summary: LiveChatConversationFeedbackSummary;
}

export interface LiveChatSendMessagePayload {
  conversationId: string;
  message: string;
}

export interface LiveChatWidgetConfig {
  apiKey?: string;
  companyName?: string;
  title?: string;
  welcomeMessage?: string;
  widgetLogo?: string;
  accentColor?: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhoneNumber?: string;
  ipAddressConsent?: boolean;
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

export interface GetWidgetConversationHistoryResponse {
  success: boolean;
  conversations: LiveChatConversation[];
  pagination: LiveChatPagination;
  historyCount: number;
  isReturningVisitor: boolean;
  visitor: LiveChatVisitor | null;
}

export interface GetWidgetVisitorProfileResponse {
  success: boolean;
  visitor: LiveChatVisitor | null;
}

export interface UpdateWidgetVisitorProfilePayload {
  fullName?: string;
  name?: string;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface UpdateWidgetVisitorProfileResponse {
  success: boolean;
  message?: string;
  visitor: LiveChatVisitor | null;
}