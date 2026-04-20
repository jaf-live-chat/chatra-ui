import type {
  LiveChatMessage,
  LiveChatWidgetConfig,
} from "../../models/LiveChatModel";

export type SocketStatus = "idle" | "connecting" | "connected" | "closed" | "error" | "unsupported";

export interface QuickMessage {
  _id: string;
  title: string;
  response: string;
}

export type WidgetTranscriptMessage = LiveChatMessage & {
  localKind?: "quick-question" | "quick-typing" | "quick-response" | "queue-update" | "assignment-update" | "system-typing" | "system-welcome";
  quickReplyId?: string;
};

export type WidgetView = "chat" | "settings" | "history";
export type TextSize = "small" | "default" | "large";

export type BrowserLocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

export type WindowWithLiveChatConfig = Window & {
  LiveChatConfig?: LiveChatWidgetConfig;
};

export interface LiveChatWidgetProps {
  initialConfig?: LiveChatWidgetConfig;
}

export type LocationPermissionState = "unknown" | "granted" | "denied" | "unavailable";
