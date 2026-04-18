import type {
  LiveChatConversation,
  LiveChatStartConversationResponse,
  LiveChatWidgetConfig,
} from "../../models/LiveChatModel";
import {
  DEFAULT_ACCENT,
  DEFAULT_TITLE,
  LEGACY_WIDGET_ACCENT_COLOR_KEY,
  WIDGET_ACCENT_COLOR_KEY,
  WIDGET_LOGO_KEY,
  WIDGET_TITLE_KEY,
  WIDGET_WELCOME_KEY,
} from "./constants";
import type { TextSize, WindowWithLiveChatConfig, WidgetTranscriptMessage } from "./types";
import { readStoredValue, writeStoredValue } from "./storage";

export const isHexColor = (value: string) => /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value.trim());

export const normalizeCompanyName = (value?: string | null) => String(value || "").trim();

export const getDefaultWidgetTitle = (companyName?: string | null) => {
  const resolvedCompanyName = normalizeCompanyName(companyName);
  return resolvedCompanyName ? `${resolvedCompanyName}` : DEFAULT_TITLE;
};

export const getDefaultWelcomeMessage = (companyName?: string | null) => {
  const resolvedCompanyName = normalizeCompanyName(companyName);
  return `Hi there. Welcome to ${resolvedCompanyName || "our support team"}. How can I help you today?`;
};

export const createVisitorToken = () => {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `visitor-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

export const getVisitorToken = (visitorTokenKey: string) => {
  const existingToken = readStoredValue(visitorTokenKey);
  if (existingToken) {
    return existingToken;
  }

  const token = createVisitorToken();
  writeStoredValue(visitorTokenKey, token);
  return token;
};

const getWindowConfig = (): LiveChatWidgetConfig => {
  if (typeof window === "undefined") {
    return {};
  }

  const liveChatWindow = window as WindowWithLiveChatConfig;
  return liveChatWindow.LiveChatConfig || {};
};

export const getResolvedConfig = (initialConfig: LiveChatWidgetConfig = {}): LiveChatWidgetConfig => {
  const windowConfig = getWindowConfig();
  const companyName = normalizeCompanyName(initialConfig.companyName || windowConfig.companyName || "");
  const defaultTitle = getDefaultWidgetTitle(companyName);
  const defaultWelcomeMessage = getDefaultWelcomeMessage(companyName);
  const storedAccentColor = readStoredValue(
    WIDGET_ACCENT_COLOR_KEY,
    readStoredValue(LEGACY_WIDGET_ACCENT_COLOR_KEY, windowConfig.accentColor || DEFAULT_ACCENT),
  );

  return {
    apiKey: initialConfig.apiKey || windowConfig.apiKey || "",
    companyName,
    title: initialConfig.title || readStoredValue(WIDGET_TITLE_KEY, windowConfig.title || defaultTitle),
    welcomeMessage: initialConfig.welcomeMessage || readStoredValue(WIDGET_WELCOME_KEY, windowConfig.welcomeMessage || defaultWelcomeMessage),
    widgetLogo: initialConfig.widgetLogo || readStoredValue(WIDGET_LOGO_KEY, windowConfig.widgetLogo || ""),
    accentColor: initialConfig.accentColor || storedAccentColor,
    visitorName: initialConfig.visitorName || windowConfig.visitorName || "",
    visitorEmail: initialConfig.visitorEmail || windowConfig.visitorEmail || "",
    visitorPhoneNumber: initialConfig.visitorPhoneNumber || windowConfig.visitorPhoneNumber || "",
    ipAddressConsent: typeof initialConfig.ipAddressConsent === "boolean"
      ? initialConfig.ipAddressConsent
      : (typeof windowConfig.ipAddressConsent === "boolean" ? windowConfig.ipAddressConsent : undefined),
  };
};

export const formatTime = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const normalizeMessages = (messages: WidgetTranscriptMessage[]) => {
  return [...messages].sort((left, right) => {
    const leftTime = new Date(left.createdAt || left.updatedAt || 0).getTime();
    const rightTime = new Date(right.createdAt || right.updatedAt || 0).getTime();
    return leftTime - rightTime;
  });
};

export const getNextOrderedTimestamp = (messages: WidgetTranscriptMessage[]) => {
  const latestMessageTime = messages.reduce((latest, message) => {
    const timestamp = new Date(message.createdAt || message.updatedAt || 0).getTime();
    if (!Number.isFinite(timestamp)) {
      return latest;
    }

    return Math.max(latest, timestamp);
  }, 0);

  return new Date(Math.max(Date.now(), latestMessageTime + 1)).toISOString();
};

export const resolveConversationIdFromAssignedEvent = (payload: LiveChatStartConversationResponse) => {
  const directConversationId = String(payload.conversation?._id || "").trim();
  if (directConversationId) {
    return directConversationId;
  }

  const queuedConversation = payload.queueEntry?.conversationId;
  if (typeof queuedConversation === "string") {
    return queuedConversation;
  }

  if (queuedConversation && typeof queuedConversation === "object" && "_id" in queuedConversation) {
    return String(queuedConversation._id || "").trim();
  }

  return "";
};

export const getErrorMessage = (error: unknown) => {
  if (isSubscriptionInactiveError(error)) {
    return "Live chat is currently unavailable because the subscription is inactive.";
  }

  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Unable to load live chat.";
};

export const isSubscriptionInactiveError = (error: unknown) => {
  const statusCode = Number((error as { response?: { status?: number } })?.response?.status || 0);
  const code = String((error as { response?: { data?: { code?: string } } })?.response?.data?.code || "").toUpperCase();
  const message = String((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "").toLowerCase();

  if (code === "SUBSCRIPTION_INACTIVE") {
    return true;
  }

  return statusCode === 403 && message.includes("subscription") && message.includes("inactive");
};

export const isConversationNotFoundError = (error: unknown) => {
  const statusCode = (error as { response?: { status?: number } })?.response?.status;
  const message = getErrorMessage(error).toLowerCase();

  return statusCode === 404 || message.includes("conversation not found");
};

export const resolveConversationIdFromStart = (response: LiveChatStartConversationResponse) => {
  if (response.conversation?._id) {
    return response.conversation._id;
  }

  const queuedConversation = response.queueEntry?.conversationId;

  if (typeof queuedConversation === "string") {
    return queuedConversation;
  }

  if (queuedConversation && typeof queuedConversation === "object" && "_id" in queuedConversation) {
    return queuedConversation._id;
  }

  return "";
};

export const parseTextSizePreference = (value: string): TextSize => {
  if (value === "small" || value === "default" || value === "large") {
    return value;
  }

  return "default";
};

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatDateOnly = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const getConversationPreview = (conversation: LiveChatConversation) => {
  const metadata = conversation as LiveChatConversation & {
    preview?: string;
    summary?: string;
    lastMessage?: string;
    latestMessage?: { message?: string };
  };

  return String(
    metadata.latestMessage?.message ||
    metadata.lastMessage ||
    metadata.preview ||
    metadata.summary ||
    "View transcript",
  ).trim();
};

export const getWidgetInitials = (value: string) => {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "JC";
  }

  if (words.length === 1) {
    return words[0].slice(0, 1).toUpperCase();
  }

  return `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`.toUpperCase();
};
