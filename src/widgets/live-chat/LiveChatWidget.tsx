import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type {
  LiveChatConversation,
  LiveChatConversationEndedEvent,
  LiveChatMessage,
  LiveChatQueuePositionChangedEvent,
  LiveChatWidgetConfig,
  LiveChatStartConversationResponse,
} from "../../models/LiveChatModel";
import liveChatWidgetServices from "../../services/liveChatWidgetServices";
import { createLiveChatSocket } from "../../services/liveChatRealtimeClient";
import {
  CONVERSATION_ID_KEY,
  DEFAULT_ACCENT,
  MESSAGE_PAGE_LIMIT,
  PANEL_CLOSE_ANIMATION_MS,
  SYSTEM_AUTO_MESSAGES_KEY,
  SYSTEM_AUTO_REPLY_TYPING_MS,
  TYPING_IDLE_TIMEOUT_MS,
  TYPING_INDICATOR_GRACE_MS,
  VISITOR_TOKEN_KEY,
  WIDGET_ACCENT_COLOR_KEY,
  WIDGET_DARK_MODE_KEY,
  WIDGET_FEEDBACK_CONVERSATION_KEY,
  WIDGET_LOGO_KEY,
  WIDGET_MESSAGE_SOUNDS_KEY,
  WIDGET_TEXT_SIZE_KEY,
  WIDGET_TITLE_KEY,
  WIDGET_WELCOME_KEY,
  LEGACY_WIDGET_ACCENT_COLOR_KEY,
} from "./constants";
import {
  getDefaultWelcomeMessage,
  getDefaultWidgetTitle,
  getErrorMessage,
  getNextOrderedTimestamp,
  getResolvedConfig,
  getVisitorToken,
  getWidgetInitials,
  isConversationNotFoundError,
  isHexColor,
  normalizeMessages,
  parseTextSizePreference,
  resolveConversationIdFromAssignedEvent,
  resolveConversationIdFromStart,
  createVisitorToken,
} from "./helpers";
import {
  clearStoredValue,
  readStoredValue,
  writeStoredValue,
} from "./storage";
import type {
  BrowserLocationSnapshot,
  LiveChatWidgetProps,
  LocationPermissionState,
  QuickMessage,
  SocketStatus,
  TextSize,
  WidgetTranscriptMessage,
  WidgetView,
} from "./types";
import WidgetHeader from "./components/WidgetHeader";
import EndSessionModal from "./components/EndSessionModal";
import FeedbackModal from "./components/FeedbackModal";
import LauncherButton from "./components/LauncherButton";
import SettingsHistoryPanel from "./components/SettingsHistoryPanel";
import ChatPanel from "./components/ChatPanel";
import { useWidgetDataSync } from "./hooks/useWidgetDataSync";
import { useWidgetStyling } from "./hooks/useWidgetStyling";

const LiveChatWidget = ({ initialConfig = {} }: LiveChatWidgetProps) => {
  const [widgetConfig, setWidgetConfig] = useState<LiveChatWidgetConfig>(() => getResolvedConfig(initialConfig));
  const [preChatFullName, setPreChatFullName] = useState("");
  const [preChatEmailAddress, setPreChatEmailAddress] = useState("");
  const [preChatPhoneNumber, setPreChatPhoneNumber] = useState("");
  const [hasCompletedPreChat, setHasCompletedPreChat] = useState(() => {
    const storedConversationId = readStoredValue(CONVERSATION_ID_KEY);
    if (storedConversationId) {
      return true;
    }

    return Boolean(readStoredValue(VISITOR_TOKEN_KEY));
  });
  const [visitorToken, setVisitorToken] = useState(() => getVisitorToken(VISITOR_TOKEN_KEY));
  const [conversationId, setConversationId] = useState(() => readStoredValue(CONVERSATION_ID_KEY));
  const [messages, setMessages] = useState<WidgetTranscriptMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => readStoredValue(WIDGET_DARK_MODE_KEY) === "true");
  const [widgetView, setWidgetView] = useState<WidgetView>("chat");
  const [textSize, setTextSize] = useState<TextSize>(() => parseTextSizePreference(readStoredValue(WIDGET_TEXT_SIZE_KEY, "default")));
  const [isMessageSoundsEnabled, setIsMessageSoundsEnabled] = useState(() => readStoredValue(WIDGET_MESSAGE_SOUNDS_KEY, "true") !== "false");
  const [browserLocation, setBrowserLocation] = useState<BrowserLocationSnapshot | null>(null);
  const [browserLocationStatus, setBrowserLocationStatus] = useState<"idle" | "resolving" | "resolved" | "denied" | "unavailable" | "error">("idle");
  const [locationPermissionState, setLocationPermissionState] = useState<LocationPermissionState>("unknown");
  const [isEndChatModalOpen, setIsEndChatModalOpen] = useState(false);
  const [isSessionEndPendingFeedback, setIsSessionEndPendingFeedback] = useState(false);
  const [isFeedbackPromptOpen, setIsFeedbackPromptOpen] = useState(false);
  const [feedbackConversationId, setFeedbackConversationId] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);
  const [activeQuickReplyId, setActiveQuickReplyId] = useState<string | null>(null);
  const [historyConversations, setHistoryConversations] = useState<LiveChatConversation[]>([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryConversationId, setSelectedHistoryConversationId] = useState("");
  const [historyMessages, setHistoryMessages] = useState<WidgetTranscriptMessage[]>([]);
  const [isHistoryTranscriptLoading, setIsHistoryTranscriptLoading] = useState(false);
  const [isReturningVisitor, setIsReturningVisitor] = useState(false);
  const [returningVisitorName, setReturningVisitorName] = useState("");
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileStatusMessage, setProfileStatusMessage] = useState("");
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const widgetSettingsRequestRef = useRef<Promise<void> | null>(null);
  const quickMessagesRequestRef = useRef<Promise<void> | null>(null);
  const historyRequestRef = useRef<Promise<void> | null>(null);
  const profileRequestRef = useRef<Promise<void> | null>(null);
  const hasLoadedWidgetSettingsRef = useRef(false);
  const hasLoadedQuickMessagesRef = useRef(false);
  const hasLoadedHistoryRef = useRef(false);
  const hasLoadedProfileRef = useRef(false);
  const quickReplyTimerRef = useRef<number | null>(null);
  const visitorTypingTimerRef = useRef<number | null>(null);
  const agentTypingTimerRef = useRef<number | null>(null);
  const latestQueuePositionRef = useRef<number | null>(null);
  const pendingQueuePositionRef = useRef<LiveChatQueuePositionChangedEvent | null>(null);
  const assignmentNoticeConversationIdRef = useRef<string>("");
  const messagesRef = useRef<WidgetTranscriptMessage[]>([]);
  const systemAutoReplyTimersRef = useRef<number[]>([]);
  const isVisitorTypingRef = useRef(false);
  const conversationBootstrapRef = useRef(false);
  const wasOpenRef = useRef(false);

  const apiKey = String(widgetConfig.apiKey || "").trim();
  const hasApiKey = Boolean(apiKey);
  const title = widgetConfig.title || getDefaultWidgetTitle(widgetConfig.companyName);
  const welcomeMessage = widgetConfig.welcomeMessage || getDefaultWelcomeMessage(widgetConfig.companyName);
  const widgetLogo = widgetConfig.widgetLogo || "";
  const accentColor = widgetConfig.accentColor || DEFAULT_ACCENT;
  const resolvedAccent = isHexColor(accentColor) ? accentColor : DEFAULT_ACCENT;
  const accentHeaderBackground = `linear-gradient(135deg, ${resolvedAccent} 0%, color-mix(in srgb, ${resolvedAccent} 72%, black 28%) 100%)`;
  const accentSoftBorder = `color-mix(in srgb, ${resolvedAccent} 24%, white)`;
  const accentShadow = `0 16px 34px -16px ${resolvedAccent}`;
  const hasRuntimeError = Boolean(errorMessage.trim());
  const isInvalidApiKeyError = /invalid\s+api\s+key/i.test(errorMessage);
  const isActionBlocked = !hasApiKey || hasRuntimeError || isLoading || isSending;
  const hasEndedConversation = useMemo(() => {
    if (conversationId) {
      return false;
    }

    return messages.some((entry) => {
      if (entry.senderType !== "SUPPORT_AGENT") {
        return false;
      }

      return String(entry.message || "").toLowerCase().includes("this chat has ended");
    });
  }, [conversationId, messages]);
  const isPreChatPending = !conversationId && !hasCompletedPreChat;
  const isComposerBlocked = isActionBlocked || isPreChatPending || hasEndedConversation;
  const hasConversationStarted = useMemo(() => {
    if (conversationId) {
      return true;
    }

    return messages.some((message) => !message.localKind);
  }, [conversationId, messages]);
  const hasActiveConversation = useMemo(() => {
    return Boolean(String(conversationId || "").trim()) && !hasEndedConversation;
  }, [conversationId, hasEndedConversation]);
  const isQuickReplyBlocked = !hasApiKey || hasRuntimeError || isLoading || isSending || hasEndedConversation || hasConversationStarted || Boolean(activeQuickReplyId);
  const displayErrorMessage = hasApiKey
    ? errorMessage
    : "This widget is not configured correctly. Missing apiKey.";
  const displayErrorTitle = isInvalidApiKeyError
    ? "Invalid API key"
    : !hasApiKey
      ? "Configuration required"
      : "Live chat unavailable";
  const statusLabel = useMemo(() => {
    switch (socketStatus) {
      case "connected":
        return "Online";
      case "connecting":
        return "Connecting...";
      case "unsupported":
        return "Unsupported";
      case "error":
        return "Reconnect required";
      case "closed":
        return "Online";
      default:
        return "Support";
    }
  }, [socketStatus]);
  const welcomeTitleMessage = isReturningVisitor
    ? `Welcome back${returningVisitorName ? `, ${returningVisitorName}` : ""}.`
    : welcomeMessage;
  const selectedHistoryConversation = useMemo(() => {
    if (!selectedHistoryConversationId) {
      return null;
    }

    return historyConversations.find((entry) => String(entry._id) === selectedHistoryConversationId) || null;
  }, [historyConversations, selectedHistoryConversationId]);
  const visitorGreetingName = useMemo(() => {
    const fromPreChat = String(preChatFullName || "").trim();
    if (fromPreChat) {
      return fromPreChat;
    }

    const fromReturning = String(returningVisitorName || "").trim();
    if (fromReturning) {
      return fromReturning;
    }

    const fromConfig = String(widgetConfig.visitorName || "").trim();
    if (fromConfig) {
      return fromConfig;
    }

    return "there";
  }, [preChatFullName, returningVisitorName, widgetConfig.visitorName]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const clearQuickReplyTimer = useCallback(() => {
    if (quickReplyTimerRef.current !== null) {
      window.clearTimeout(quickReplyTimerRef.current);
      quickReplyTimerRef.current = null;
    }
  }, []);

  const clearVisitorTypingTimer = useCallback(() => {
    if (visitorTypingTimerRef.current !== null) {
      window.clearTimeout(visitorTypingTimerRef.current);
      visitorTypingTimerRef.current = null;
    }
  }, []);

  const clearAgentTypingTimer = useCallback(() => {
    if (agentTypingTimerRef.current !== null) {
      window.clearTimeout(agentTypingTimerRef.current);
      agentTypingTimerRef.current = null;
    }
  }, []);

  const clearSystemAutoReplyTimers = useCallback(() => {
    if (systemAutoReplyTimersRef.current.length === 0) {
      return;
    }

    systemAutoReplyTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    systemAutoReplyTimersRef.current = [];
  }, []);

  const readPersistedSystemMessages = useCallback((targetConversationId: string) => {
    if (typeof window === "undefined" || !targetConversationId) {
      return [] as WidgetTranscriptMessage[];
    }

    try {
      const rawValue = window.localStorage.getItem(SYSTEM_AUTO_MESSAGES_KEY);
      if (!rawValue) {
        return [] as WidgetTranscriptMessage[];
      }

      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) {
        return [] as WidgetTranscriptMessage[];
      }

      return parsed
        .filter((entry) => entry && typeof entry === "object")
        .filter((entry) => String(entry.conversationId || "") === targetConversationId)
        .map((entry): WidgetTranscriptMessage => ({
          _id: String(entry._id || ""),
          conversationId: String(entry.conversationId || ""),
          senderType: "SUPPORT_AGENT",
          senderId: "SYSTEM",
          message: String(entry.message || ""),
          status: "DELIVERED",
          createdAt: String(entry.createdAt || ""),
          localKind: entry.localKind === "assignment-update"
            ? "assignment-update"
            : "queue-update",
        }))
        .filter((entry) => Boolean(entry._id && entry.conversationId && entry.message));
    } catch {
      return [] as WidgetTranscriptMessage[];
    }
  }, []);

  const persistSystemMessage = useCallback((message: WidgetTranscriptMessage) => {
    if (typeof window === "undefined") {
      return;
    }

    if (message.localKind !== "queue-update" && message.localKind !== "assignment-update") {
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(SYSTEM_AUTO_MESSAGES_KEY);
      const parsed = rawValue ? JSON.parse(rawValue) : [];
      const safeEntries = Array.isArray(parsed) ? parsed.filter((entry) => entry && typeof entry === "object") : [];

      const nextEntries = [
        ...safeEntries.filter((entry) => String(entry._id || "") !== String(message._id)),
        {
          _id: String(message._id),
          conversationId: String(message.conversationId || ""),
          message: String(message.message || ""),
          createdAt: String(message.createdAt || new Date().toISOString()),
          localKind: message.localKind,
        },
      ];

      window.localStorage.setItem(SYSTEM_AUTO_MESSAGES_KEY, JSON.stringify(nextEntries));
    } catch {
      // Ignore storage errors in embedded contexts.
    }
  }, []);

  const clearPersistedSystemMessages = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(SYSTEM_AUTO_MESSAGES_KEY);
    } catch {
      // Ignore storage errors in embedded contexts.
    }
  }, []);

  const stopVisitorTyping = useCallback((notifyServer = true) => {
    clearVisitorTypingTimer();

    if (!isVisitorTypingRef.current) {
      return;
    }

    const activeConversationId = String(conversationId || "").trim();
    if (notifyServer && socketRef.current && activeConversationId) {
      socketRef.current.emit("STOP_TYPING", { conversationId: activeConversationId });
    }

    isVisitorTypingRef.current = false;
  }, [clearVisitorTypingTimer, conversationId]);

  const markVisitorTyping = useCallback(() => {
    const activeConversationId = String(conversationId || "").trim();
    if (!activeConversationId || !socketRef.current) {
      return;
    }

    if (!isVisitorTypingRef.current) {
      socketRef.current.emit("TYPING", { conversationId: activeConversationId });
      isVisitorTypingRef.current = true;
    }

    clearVisitorTypingTimer();
    visitorTypingTimerRef.current = window.setTimeout(() => {
      if (socketRef.current && String(conversationId || "").trim()) {
        socketRef.current.emit("STOP_TYPING", { conversationId: activeConversationId });
      }

      isVisitorTypingRef.current = false;
      visitorTypingTimerRef.current = null;
    }, TYPING_IDLE_TIMEOUT_MS);
  }, [clearVisitorTypingTimer, conversationId]);

  const handleComposerTextChange = useCallback((nextValue: string) => {
    setMessageText(nextValue);

    if (!String(conversationId || "").trim()) {
      return;
    }

    if (!nextValue.trim()) {
      stopVisitorTyping();
      return;
    }

    markVisitorTyping();
  }, [conversationId, markVisitorTyping, stopVisitorTyping]);

  const playIncomingMessageSound = useCallback(() => {
    if (!isMessageSoundsEnabled || typeof window === "undefined") {
      return;
    }

    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }

    try {
      const context = audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = context;

      if (context.state === "suspended") {
        void context.resume();
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const now = context.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, now);
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch {
      // Ignore browser audio restrictions or unsupported playback environments.
    }
  }, [isMessageSoundsEnabled]);

  const requestBrowserLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setBrowserLocation(null);
      setLocationPermissionState("unavailable");
      setBrowserLocationStatus("unavailable");
      return;
    }

    setBrowserLocationStatus("resolving");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBrowserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: typeof position.coords.accuracy === "number" ? position.coords.accuracy : null,
        });
        setLocationPermissionState("granted");
        setBrowserLocationStatus("resolved");
      },
      (error) => {
        setBrowserLocation(null);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionState("denied");
          setBrowserLocationStatus("denied");
          return;
        }

        setLocationPermissionState("unavailable");
        setBrowserLocationStatus("error");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, []);

  const {
    syncMessages,
    syncWidgetSettings,
    syncQuickMessages,
    syncConversationHistory,
    syncVisitorProfile,
    syncBootstrapData,
    loadHistoryTranscript,
  } = useWidgetDataSync({
    apiKey,
    hasApiKey,
    visitorToken,
    widgetConfig,
    conversationId,
    readPersistedSystemMessages,
    setMessages,
    setConversationId,
    setErrorMessage,
    getErrorMessage,
    setWidgetConfig,
    setQuickMessages,
    setHistoryConversations,
    setHistoryCount,
    setIsReturningVisitor,
    setReturningVisitorName,
    setIsHistoryLoading,
    setHistoryError,
    setPreChatFullName,
    setPreChatEmailAddress,
    setPreChatPhoneNumber,
    setIsHistoryTranscriptLoading,
    setHistoryMessages,
    widgetSettingsRequestRef,
    quickMessagesRequestRef,
    historyRequestRef,
    profileRequestRef,
    hasLoadedWidgetSettingsRef,
    hasLoadedQuickMessagesRef,
    hasLoadedHistoryRef,
    hasLoadedProfileRef,
  });

  const appendQueuePositionMessage = useCallback((
    payload: LiveChatQueuePositionChangedEvent | null | undefined,
    overrideConversationId?: string,
  ) => {
    const targetConversationId = String(overrideConversationId || conversationId || "").trim();
    const payloadConversationId = String(payload?.conversationId || "").trim();

    if (!targetConversationId || !payloadConversationId || payloadConversationId !== targetConversationId) {
      return;
    }

    const position = Number(payload?.position);
    if (!Number.isFinite(position) || position < 1) {
      return;
    }

    const hasVisitorInitiated = messagesRef.current.some((entry) => entry.senderType === "VISITOR");
    if (!hasVisitorInitiated && String(payload?.reason || "").toUpperCase() === "ENTERED_QUEUE") {
      pendingQueuePositionRef.current = {
        ...payload,
        conversationId: targetConversationId,
        position,
      };
      return;
    }

    if (latestQueuePositionRef.current === position) {
      return;
    }

    latestQueuePositionRef.current = position;

    const targetMessage = `Hi ${visitorGreetingName} kindly wait while you're in queue and you're in Queue ${position}`;
    const replyToken = `${targetConversationId}-${position}-${Date.now()}`;
    const typingId = `queue-update-typing-${replyToken}`;
    const messageId = `queue-update-${replyToken}`;

    setMessages((currentMessages) => {
      const typingMessage: WidgetTranscriptMessage = {
        _id: typingId,
        conversationId: targetConversationId,
        senderType: "SUPPORT_AGENT",
        senderId: "SYSTEM",
        message: "",
        status: "DELIVERED",
        createdAt: getNextOrderedTimestamp(currentMessages),
        localKind: "system-typing",
      };

      return normalizeMessages([...currentMessages, typingMessage]);
    });

    const timerId = window.setTimeout(() => {
      setMessages((currentMessages) => {
        const withoutTyping = currentMessages.filter((entry) => String(entry._id) !== typingId);

        const queueMessage: WidgetTranscriptMessage = {
          _id: messageId,
          conversationId: targetConversationId,
          senderType: "SUPPORT_AGENT",
          senderId: "SYSTEM",
          message: targetMessage,
          status: "DELIVERED",
          createdAt: getNextOrderedTimestamp(withoutTyping),
          localKind: "queue-update",
        };

        persistSystemMessage(queueMessage);

        return normalizeMessages([...withoutTyping, queueMessage]);
      });

      systemAutoReplyTimersRef.current = systemAutoReplyTimersRef.current.filter((activeTimerId) => activeTimerId !== timerId);
    }, SYSTEM_AUTO_REPLY_TYPING_MS);

    systemAutoReplyTimersRef.current.push(timerId);
  }, [conversationId, persistSystemMessage, visitorGreetingName]);

  const startConversation = useCallback(async (): Promise<string | null> => {
    if (!hasApiKey) {
      setErrorMessage("Configure an apiKey to start the live chat widget.");
      return null;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const sanitizedEmail = preChatEmailAddress.trim();
      if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        setErrorMessage("Please enter a valid email address or leave it blank.");
        return null;
      }

      const response: LiveChatStartConversationResponse = await liveChatWidgetServices.startConversation(
        widgetConfig,
        visitorToken,
        {
          fullName: preChatFullName.trim(),
          emailAddress: sanitizedEmail,
          phoneNumber: preChatPhoneNumber.trim(),
          ipAddressConsent: locationPermissionState === "granted" && Boolean(browserLocation),
          locationConsent: locationPermissionState === "granted" && Boolean(browserLocation),
          browserLatitude: locationPermissionState === "granted" ? browserLocation?.latitude : undefined,
          browserLongitude: locationPermissionState === "granted" ? browserLocation?.longitude : undefined,
        },
      );

      const nextConversationId = resolveConversationIdFromStart(response);

      if (!nextConversationId) {
        throw new Error("Conversation could not be created.");
      }

      setConversationId(nextConversationId);
      setHasCompletedPreChat(true);
      writeStoredValue(CONVERSATION_ID_KEY, nextConversationId);

      if (response.initialMessage) {
        setMessages(normalizeMessages([response.initialMessage]));
      } else {
        setMessages([]);
      }

      await syncMessages(nextConversationId);

      if (response.queueEntry?.status === "WAITING" && response.queuePosition) {
        pendingQueuePositionRef.current = {
          ...response.queuePosition,
          conversationId: nextConversationId,
        };
      }

      return nextConversationId;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [browserLocation, hasApiKey, locationPermissionState, preChatEmailAddress, preChatFullName, preChatPhoneNumber, syncMessages, visitorToken, widgetConfig]);


  const handleSaveProfile = useCallback(async () => {
    if (!hasApiKey || isProfileSaving) {
      return;
    }

    const sanitizedEmail = preChatEmailAddress.trim();
    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      setProfileStatusMessage("Please enter a valid email address.");
      return;
    }

    setIsProfileSaving(true);
    setProfileStatusMessage("");

    try {
      const response = await liveChatWidgetServices.updateVisitorProfile(
        { apiKey },
        visitorToken,
        {
          fullName: preChatFullName,
          emailAddress: sanitizedEmail,
          phoneNumber: preChatPhoneNumber,
        },
      );

      const visitor = response.visitor;
      setPreChatFullName(String(visitor?.name || visitor?.fullName || ""));
      setPreChatEmailAddress(String(visitor?.emailAddress || ""));
      setPreChatPhoneNumber(String(visitor?.phoneNumber || ""));
      setProfileStatusMessage("Profile saved.");
      setErrorMessage("");
    } catch (error) {
      setProfileStatusMessage(getErrorMessage(error));
    } finally {
      setIsProfileSaving(false);
    }
  }, [apiKey, hasApiKey, isProfileSaving, preChatEmailAddress, preChatFullName, preChatPhoneNumber, visitorToken]);

  const openSettingsView = useCallback(() => {
    setWidgetView("settings");
    setSelectedHistoryConversationId("");
    setHistoryMessages([]);
    setHistoryError("");
    setIsHeaderMenuOpen(false);
    void syncVisitorProfile();
  }, [syncVisitorProfile]);

  const openHistoryView = useCallback(() => {
    setWidgetView("history");
    setSelectedHistoryConversationId("");
    setHistoryMessages([]);
    setHistoryError("");
    setIsHeaderMenuOpen(false);
    void syncConversationHistory(true);
  }, [syncConversationHistory]);

  const handleSendMessage = useCallback(async (presetMessage?: string) => {
    const trimmedMessage = String(presetMessage ?? messageText).trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    if (!conversationId && !hasCompletedPreChat) {
      setErrorMessage("Complete the optional pre-chat form step first.");
      return;
    }

    let activeConversationId: string | null = conversationId || null;

    if (!activeConversationId) {
      activeConversationId = await startConversation();
      if (!activeConversationId) {
        return;
      }
    }

    const resolvedConversationId = activeConversationId;

    stopVisitorTyping();
    setIsSending(true);
    setErrorMessage("");

    try {
      const optimisticMessage: WidgetTranscriptMessage = {
        _id: `local-${Date.now()}`,
        conversationId: resolvedConversationId,
        senderType: "VISITOR",
        senderId: visitorToken,
        message: trimmedMessage,
        status: "SENDING",
        createdAt: new Date().toISOString(),
      };

      setMessages((currentMessages) => {
        const nextMessages = [...currentMessages, optimisticMessage];
        const pendingQueuePosition = pendingQueuePositionRef.current;

        if (
          pendingQueuePosition
          && String(pendingQueuePosition.conversationId || "") === String(resolvedConversationId)
        ) {
          const pendingPosition = Number(pendingQueuePosition.position);
          if (Number.isFinite(pendingPosition) && pendingPosition >= 1 && latestQueuePositionRef.current !== pendingPosition) {
            void appendQueuePositionMessage({
              conversationId: resolvedConversationId,
              position: pendingPosition,
              reason: "POSITION_UPDATED",
            }, resolvedConversationId);
          }

          pendingQueuePositionRef.current = null;
        }

        return normalizeMessages(nextMessages);
      });
      if (!presetMessage) {
        setMessageText("");
        if (messageInputRef.current) {
          messageInputRef.current.style.height = "auto";
        }
      }

      await liveChatWidgetServices.sendMessage(widgetConfig, visitorToken, {
        conversationId: resolvedConversationId,
        message: trimmedMessage,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      await syncMessages(resolvedConversationId);
    } finally {
      setIsSending(false);

      // Keep typing flow uninterrupted after each send.
      if (!presetMessage) {
        window.requestAnimationFrame(() => {
          const input = messageInputRef.current;
          if (!input) {
            return;
          }

          input.focus({ preventScroll: true });
          const cursorPosition = input.value.length;
          input.setSelectionRange(cursorPosition, cursorPosition);
        });
      }
    }
  }, [appendQueuePositionMessage, conversationId, hasCompletedPreChat, isSending, messageText, startConversation, stopVisitorTyping, syncMessages, visitorGreetingName, visitorToken, widgetConfig]);

  const handleQuickMessageClick = useCallback((quickMessage: QuickMessage) => {
    if (isQuickReplyBlocked) {
      return;
    }

    const questionText = String(quickMessage.title || "").trim();
    const responseText = String(quickMessage.response || "").trim();

    if (!questionText || !responseText) {
      return;
    }

    clearQuickReplyTimer();

    const quickReplyId = quickMessage._id;
    const now = Date.now();
    const typingCreatedAt = new Date(now + 1).toISOString();
    const questionMessage: WidgetTranscriptMessage = {
      _id: `quick-question-${quickReplyId}-${now}`,
      conversationId: quickReplyId,
      senderType: "VISITOR",
      senderId: `quick-${quickReplyId}`,
      message: questionText,
      status: "DELIVERED",
      createdAt: new Date(now).toISOString(),
      localKind: "quick-question",
      quickReplyId,
    };
    const typingMessage: WidgetTranscriptMessage = {
      _id: `quick-typing-${quickReplyId}-${now}`,
      conversationId: quickReplyId,
      senderType: "SUPPORT_AGENT",
      senderId: "SYSTEM",
      message: "",
      status: "DELIVERED",
      createdAt: typingCreatedAt,
      localKind: "quick-typing",
      quickReplyId,
    };

    setActiveQuickReplyId(quickReplyId);
    setShowQuickMessages(false);
    setMessages((currentMessages) => normalizeMessages([...currentMessages, questionMessage, typingMessage]));

    quickReplyTimerRef.current = window.setTimeout(() => {
      const responseMessage: WidgetTranscriptMessage = {
        _id: `quick-response-${quickReplyId}-${Date.now()}`,
        conversationId: quickReplyId,
        senderType: "SUPPORT_AGENT",
        senderId: "SYSTEM",
        message: responseText,
        status: "DELIVERED",
        createdAt: new Date().toISOString(),
        localKind: "quick-response",
        quickReplyId,
      };

      setMessages((currentMessages) => {
        const nextMessages = currentMessages.filter((message) => message.localKind !== "quick-typing" || message.quickReplyId !== quickReplyId);
        return normalizeMessages([...nextMessages, responseMessage]);
      });

      setActiveQuickReplyId(null);
      quickReplyTimerRef.current = null;
    }, 1100);
  }, [clearQuickReplyTimer, isQuickReplyBlocked]);

  const appendCustomerFriendlyWelcomeMessage = useCallback(() => {
    const automatedWelcomeMessage = welcomeMessage;
    const targetConversationId = String(conversationId || "pre-chat");
    const replyToken = `${targetConversationId}-${Date.now()}`;
    const typingId = `welcome-typing-${replyToken}`;
    const messageId = `system-welcome-${replyToken}`;

    setMessages((currentMessages) => {
      const hasExistingWelcome = currentMessages.some((entry) => entry.localKind === "system-welcome");
      if (hasExistingWelcome) {
        return currentMessages;
      }

      const typingMessage: WidgetTranscriptMessage = {
        _id: typingId,
        conversationId: targetConversationId,
        senderType: "SUPPORT_AGENT",
        senderId: "SYSTEM",
        message: "",
        status: "DELIVERED",
        createdAt: getNextOrderedTimestamp(currentMessages),
        localKind: "system-typing",
      };

      return normalizeMessages([...currentMessages, typingMessage]);
    });

    const timerId = window.setTimeout(() => {
      setMessages((currentMessages) => {
        const withoutTyping = currentMessages.filter((entry) => String(entry._id) !== typingId);
        const hasExistingWelcome = withoutTyping.some((entry) => entry.localKind === "system-welcome");

        if (hasExistingWelcome) {
          return withoutTyping;
        }

        const welcomeMessageEntry: WidgetTranscriptMessage = {
          _id: messageId,
          conversationId: targetConversationId,
          senderType: "SUPPORT_AGENT",
          senderId: "SYSTEM",
          message: automatedWelcomeMessage,
          status: "DELIVERED",
          createdAt: getNextOrderedTimestamp(withoutTyping),
          localKind: "system-welcome",
        };

        return normalizeMessages([...withoutTyping, welcomeMessageEntry]);
      });

      systemAutoReplyTimersRef.current = systemAutoReplyTimersRef.current.filter((activeTimerId) => activeTimerId !== timerId);
    }, SYSTEM_AUTO_REPLY_TYPING_MS);

    systemAutoReplyTimersRef.current.push(timerId);
  }, [conversationId, welcomeMessage]);

  const handleCompletePreChat = useCallback(() => {
    setHasCompletedPreChat(true);
    setErrorMessage("");
    appendCustomerFriendlyWelcomeMessage();
  }, [appendCustomerFriendlyWelcomeMessage]);

  const openPostChatFeedbackPrompt = useCallback((endedConversationId?: string) => {
    const targetConversationId = String(endedConversationId || conversationId || "").trim();

    if (!targetConversationId || readStoredValue(WIDGET_FEEDBACK_CONVERSATION_KEY) === targetConversationId) {
      return;
    }

    setFeedbackConversationId(targetConversationId);
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackMessage("");
    setIsFeedbackSubmitting(false);
    setIsFeedbackPromptOpen(true);
  }, [conversationId]);

  const resetConversationState = useCallback(() => {
    clearSystemAutoReplyTimers();
    clearQuickReplyTimer();
    stopVisitorTyping(false);
    clearAgentTypingTimer();
    disconnectSocket();
    setConversationId("");
    setMessages([]);
    setMessageText("");
    setUnreadCount(0);
    setErrorMessage("");
    setHasCompletedPreChat(true);
    setActiveQuickReplyId(null);
    setShowQuickMessages(false);
    setSelectedHistoryConversationId("");
    setHistoryMessages([]);
    setIsAgentTyping(false);
    latestQueuePositionRef.current = null;
    pendingQueuePositionRef.current = null;
    assignmentNoticeConversationIdRef.current = "";
    clearStoredValue(CONVERSATION_ID_KEY);
  }, [clearAgentTypingTimer, clearQuickReplyTimer, clearSystemAutoReplyTimers, disconnectSocket, stopVisitorTyping]);

  const handleEndChat = useCallback(async () => {
    if (conversationId) {
      try {
        const response = await liveChatWidgetServices.endConversation(widgetConfig, visitorToken, conversationId);
        openPostChatFeedbackPrompt(response.conversation?._id || conversationId);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    }

    resetConversationState();
    void syncConversationHistory(true);
  }, [conversationId, openPostChatFeedbackPrompt, resetConversationState, syncConversationHistory, visitorToken, widgetConfig]);

  const handleGoBackToStart = useCallback(() => {
    resetConversationState();
    setWidgetView("chat");
    appendCustomerFriendlyWelcomeMessage();
  }, [appendCustomerFriendlyWelcomeMessage, resetConversationState]);

  const openEndSessionPrompt = useCallback(() => {
    setIsHeaderMenuOpen(false);
    setIsEndChatModalOpen(true);
  }, []);

  const finalizeEndSession = useCallback(() => {
    clearSystemAutoReplyTimers();
    clearQuickReplyTimer();
    stopVisitorTyping(false);
    clearAgentTypingTimer();
    disconnectSocket();
    clearStoredValue(CONVERSATION_ID_KEY);
    clearStoredValue(VISITOR_TOKEN_KEY);

    const nextVisitorToken = createVisitorToken();
    writeStoredValue(VISITOR_TOKEN_KEY, nextVisitorToken);
    setVisitorToken(nextVisitorToken);

    setConversationId("");
    setMessages([]);
    setMessageText("");
    setUnreadCount(0);
    setErrorMessage("");
    setHasCompletedPreChat(false);
    setActiveQuickReplyId(null);
    setShowQuickMessages(false);
    setPreChatFullName("");
    setPreChatEmailAddress("");
    setPreChatPhoneNumber("");
    setBrowserLocation(null);
    setBrowserLocationStatus("idle");
    setLocationPermissionState("unknown");
    setHistoryConversations([]);
    setHistoryCount(0);
    setHistoryMessages([]);
    setSelectedHistoryConversationId("");
    setIsReturningVisitor(false);
    setReturningVisitorName("");
    setWidgetView("chat");
    setProfileStatusMessage("Session ended. You are logged out.");
    setIsEndChatModalOpen(false);
    setIsSessionEndPendingFeedback(false);
    setIsFeedbackPromptOpen(false);
    setFeedbackConversationId("");
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackMessage("");
    setIsFeedbackSubmitting(false);
    setIsAgentTyping(false);
    latestQueuePositionRef.current = null;
    pendingQueuePositionRef.current = null;
    assignmentNoticeConversationIdRef.current = "";
  }, [clearAgentTypingTimer, clearQuickReplyTimer, clearSystemAutoReplyTimers, disconnectSocket, stopVisitorTyping]);

  const handleEndSession = useCallback(async () => {
    setIsEndChatModalOpen(false);

    const activeConversationId = String(conversationId || "").trim();
    if (activeConversationId) {
      try {
        await liveChatWidgetServices.endConversation(widgetConfig, visitorToken, activeConversationId);
      } catch {
        // Continue session-end flow even if ending the active chat fails.
      }

      const hasFeedbackAlreadyHandled = readStoredValue(WIDGET_FEEDBACK_CONVERSATION_KEY) === activeConversationId;
      if (!hasFeedbackAlreadyHandled) {
        setIsSessionEndPendingFeedback(true);
        openPostChatFeedbackPrompt(activeConversationId);
        return;
      }
    }

    finalizeEndSession();
  }, [conversationId, finalizeEndSession, openPostChatFeedbackPrompt, visitorToken, widgetConfig]);

  const appendEndedMessage = useCallback((payload: LiveChatConversationEndedEvent) => {
    const endedBy = payload.endedBy?.displayName ? ` Ended by ${payload.endedBy.displayName}.` : "";
    const endedTimestamp = payload.endedBy?.endedAt || payload.conversation?.closedAt || new Date().toISOString();
    const endedMessage: WidgetTranscriptMessage = {
      _id: `ended-${String(payload.conversation?._id || conversationId || Date.now())}`,
      conversationId: String(payload.conversation?._id || conversationId || ""),
      senderType: "SUPPORT_AGENT",
      senderId: String(payload.endedBy?.id || "SYSTEM"),
      message: `This chat has ended.${endedBy}`,
      status: "DELIVERED",
      createdAt: endedTimestamp,
    };

    setMessages((currentMessages) => {
      if (currentMessages.some((entry) => String(entry._id) === endedMessage._id)) {
        return currentMessages;
      }

      return normalizeMessages([...currentMessages, endedMessage]);
    });
  }, [conversationId]);

  const closePostChatFeedbackPrompt = useCallback((markComplete = false) => {
    if (markComplete && feedbackConversationId) {
      writeStoredValue(WIDGET_FEEDBACK_CONVERSATION_KEY, feedbackConversationId);
    }

    setIsFeedbackPromptOpen(false);
    setFeedbackConversationId("");
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackMessage("");
    setIsFeedbackSubmitting(false);

    if (isSessionEndPendingFeedback) {
      finalizeEndSession();
    }
  }, [feedbackConversationId, finalizeEndSession, isSessionEndPendingFeedback]);

  const submitPostChatFeedback = useCallback(async () => {
    const targetConversationId = String(feedbackConversationId || "").trim();

    if (!targetConversationId || feedbackRating < 1 || feedbackRating > 5 || isFeedbackSubmitting) {
      return;
    }

    setIsFeedbackSubmitting(true);
    setFeedbackMessage("");

    try {
      await liveChatWidgetServices.submitConversationFeedback(widgetConfig, visitorToken, targetConversationId, {
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      });

      closePostChatFeedbackPrompt(true);
    } catch (error) {
      setFeedbackMessage(getErrorMessage(error));
    } finally {
      setIsFeedbackSubmitting(false);
    }
  }, [closePostChatFeedbackPrompt, feedbackComment, feedbackConversationId, feedbackRating, isFeedbackSubmitting, visitorToken, widgetConfig]);

  const {
    messageSizeClass,
    messageMetaSizeClass,
    composerTextClass,
    bubblePaddingClass,
    avatarSizeClass,
    helperTextSizeClass,
    panelSpacingClass,
    headerTitleClass,
    headerStatusClass,
    composerGapClass,
    composerButtonSizeClass,
    inputPaddingClass,
    theme,
  } = useWidgetStyling({ textSize, isDarkMode });

  useEffect(() => {
    hasLoadedWidgetSettingsRef.current = false;
    hasLoadedQuickMessagesRef.current = false;
    hasLoadedHistoryRef.current = false;
    hasLoadedProfileRef.current = false;
  }, [apiKey, visitorToken]);

  useEffect(() => {
    const syncConfig = () => {
      const resolvedConfig = getResolvedConfig(initialConfig);
      setWidgetConfig(resolvedConfig);
      setIsDarkMode(readStoredValue(WIDGET_DARK_MODE_KEY) === "true");
      setTextSize(parseTextSizePreference(readStoredValue(WIDGET_TEXT_SIZE_KEY, "default")));
      setIsMessageSoundsEnabled(readStoredValue(WIDGET_MESSAGE_SOUNDS_KEY, "true") !== "false");
    };

    const handleOpenChat = () => {
      setIsOpen(true);
    };

    const handleStorage = () => syncConfig();

    window.addEventListener("open-live-chat", handleOpenChat);
    window.addEventListener("storage", handleStorage);

    syncConfig();

    return () => {
      window.removeEventListener("open-live-chat", handleOpenChat);
      window.removeEventListener("storage", handleStorage);
    };
  }, [initialConfig]);

  useEffect(() => {
    if (!isOpen || locationPermissionState !== "unknown") {
      return;
    }

    if (browserLocationStatus === "resolving") {
      return;
    }

    requestBrowserLocation();
  }, [browserLocationStatus, isOpen, locationPermissionState, requestBrowserLocation]);

  useEffect(() => {
    if (isOpen) {
      setShouldRenderPanel(true);
      const rafId = window.requestAnimationFrame(() => {
        setIsPanelVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }

    setIsPanelVisible(false);

    if (!shouldRenderPanel) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldRenderPanel(false);
    }, PANEL_CLOSE_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, shouldRenderPanel]);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setWidgetView("chat");
      setIsEndChatModalOpen(false);
      setShowQuickMessages(false);
      setProfileStatusMessage("");
      setIsHeaderMenuOpen(false);
    }

    if (!isOpen) {
      setIsHeaderMenuOpen(false);
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isHeaderMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!headerMenuRef.current) {
        return;
      }

      const targetNode = event.target;
      if (targetNode instanceof Node && !headerMenuRef.current.contains(targetNode)) {
        setIsHeaderMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHeaderMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isHeaderMenuOpen]);

  useEffect(() => {
    if (!isOpen) {
      conversationBootstrapRef.current = false;
      return;
    }

    if (conversationBootstrapRef.current) {
      return;
    }

    conversationBootstrapRef.current = true;
    setUnreadCount(0);

    if (!hasApiKey) {
      setErrorMessage("Configure an apiKey to start the live chat widget.");
      return;
    }

    void syncBootstrapData();

    if (!conversationId) {
      return;
    }

    void syncMessages(conversationId);
  }, [conversationId, hasApiKey, isOpen, syncBootstrapData, syncMessages]);

  useEffect(() => {
    // If returning visitor, skip pre-chat form and go straight to chat
    if (isReturningVisitor && !conversationId) {
      setHasCompletedPreChat(true);
      appendCustomerFriendlyWelcomeMessage();
    }
    // If new visitor (not returning), ensure pre-chat form is shown
    else if (!isReturningVisitor && historyCount === 0 && isOpen && !conversationId) {
      setHasCompletedPreChat(false);
    }
  }, [isReturningVisitor, historyCount, isOpen, conversationId, appendCustomerFriendlyWelcomeMessage]);

  useEffect(() => {
    if (!apiKey || !conversationId) {
      stopVisitorTyping(false);
      clearAgentTypingTimer();
      setIsAgentTyping(false);
      disconnectSocket();
      setSocketStatus(apiKey ? "closed" : "idle");
      return;
    }

    const socket = createLiveChatSocket({
      apiKey,
      visitorToken,
      conversationId,
      role: "VISITOR",
    });

    if (!socket) {
      setSocketStatus("unsupported");
      return;
    }

    disconnectSocket();
    socketRef.current = socket;
    setSocketStatus("connecting");

    socket.on("connect", () => {
      setSocketStatus("connected");
      clearPersistedSystemMessages();
    });

    socket.on("disconnect", () => {
      setSocketStatus("closed");
      setIsAgentTyping(false);
      clearAgentTypingTimer();
    });

    socket.on("connect_error", () => {
      setSocketStatus("error");
      setIsAgentTyping(false);
      clearAgentTypingTimer();
    });

    socket.on("TYPING", (payload: { conversationId?: string; senderRole?: string }) => {
      const targetConversationId = String(payload?.conversationId || "");
      if (!targetConversationId || targetConversationId !== String(conversationId)) {
        return;
      }

      if (payload?.senderRole === "VISITOR") {
        return;
      }

      setIsAgentTyping(true);
      clearAgentTypingTimer();
      agentTypingTimerRef.current = window.setTimeout(() => {
        setIsAgentTyping(false);
        agentTypingTimerRef.current = null;
      }, TYPING_INDICATOR_GRACE_MS);
    });

    socket.on("STOP_TYPING", (payload: { conversationId?: string; senderRole?: string }) => {
      const targetConversationId = String(payload?.conversationId || "");
      if (!targetConversationId || targetConversationId !== String(conversationId)) {
        return;
      }

      if (payload?.senderRole === "VISITOR") {
        return;
      }

      setIsAgentTyping(false);
      clearAgentTypingTimer();
    });

    socket.on("NEW_MESSAGE", (incomingMessage: LiveChatMessage) => {
      if (!incomingMessage || String(incomingMessage.conversationId || "") !== String(conversationId)) {
        return;
      }

      setMessages((currentMessages) => {
        const nextMessages = [...currentMessages];
        const incomingId = String(incomingMessage._id || "");
        const byIdIndex = incomingId ? nextMessages.findIndex((message) => String(message._id) === incomingId) : -1;

        if (byIdIndex >= 0) {
          nextMessages[byIdIndex] = {
            ...nextMessages[byIdIndex],
            ...incomingMessage,
          };
          return normalizeMessages(nextMessages);
        }

        if (incomingMessage.senderType === "VISITOR") {
          const localMessageIndex = nextMessages.findIndex(
            (message) => String(message._id).startsWith("local-")
              && message.senderType === "VISITOR"
              && message.message === incomingMessage.message,
          );

          if (localMessageIndex >= 0) {
            const localMessage = nextMessages[localMessageIndex];
            nextMessages[localMessageIndex] = {
              ...localMessage,
              ...incomingMessage,
              // Keep optimistic client timestamp so ordering does not jump on server ack.
              createdAt: localMessage.createdAt || incomingMessage.createdAt,
            };
            return normalizeMessages(nextMessages);
          }
        }

        nextMessages.push(incomingMessage);
        return normalizeMessages(nextMessages);
      });

      if (incomingMessage.senderType !== "VISITOR") {
        setIsAgentTyping(false);
        clearAgentTypingTimer();
        playIncomingMessageSound();

        if (!isOpen) {
          setUnreadCount((currentCount) => currentCount + 1);
        }
      }
    });

    socket.on("MESSAGE_STATUS_UPDATED", (payload: { messageIds?: string[]; status?: "DELIVERED" | "SEEN" }) => {
      if (!Array.isArray(payload?.messageIds) || !payload.status) {
        return;
      }

      const messageIds = new Set(payload.messageIds.map((id) => String(id)));
      setMessages((currentMessages) => currentMessages.map((message) => {
        if (!messageIds.has(String(message._id))) {
          return message;
        }

        return {
          ...message,
          status: payload.status,
        };
      }));
    });

    socket.on("QUEUE_POSITION_CHANGED", (payload: LiveChatQueuePositionChangedEvent) => {
      appendQueuePositionMessage(payload);
    });

    socket.on("CONVERSATION_ASSIGNED", (payload: LiveChatStartConversationResponse) => {
      const assignedConversationId = resolveConversationIdFromAssignedEvent(payload);
      const activeConversationId = String(conversationId || "").trim();

      if (!assignedConversationId || !activeConversationId || assignedConversationId !== activeConversationId) {
        return;
      }

      if (assignmentNoticeConversationIdRef.current === assignedConversationId) {
        return;
      }

      assignmentNoticeConversationIdRef.current = assignedConversationId;
      latestQueuePositionRef.current = null;
      pendingQueuePositionRef.current = null;

      const assignedAgentName = String(payload.agent?.fullName || payload.agent?.displayName || "").trim();
      const assignmentMessage = assignedAgentName
        ? `Hi ${visitorGreetingName} you are now connected with ${assignedAgentName}.`
        : `Hi ${visitorGreetingName} you are now connected with an agent.`;

      const replyToken = `${assignedConversationId}-${Date.now()}`;
      const typingId = `assignment-update-typing-${replyToken}`;
      const messageId = `assignment-update-${replyToken}`;

      setMessages((currentMessages) => {
        const typingMessage: WidgetTranscriptMessage = {
          _id: typingId,
          conversationId: assignedConversationId,
          senderType: "SUPPORT_AGENT",
          senderId: "SYSTEM",
          message: "",
          status: "DELIVERED",
          createdAt: getNextOrderedTimestamp(currentMessages),
          localKind: "system-typing",
        };

        return normalizeMessages([...currentMessages, typingMessage]);
      });

      const timerId = window.setTimeout(() => {
        setMessages((currentMessages) => {
          const withoutTyping = currentMessages.filter((entry) => String(entry._id) !== typingId);

          const assignedMessage: WidgetTranscriptMessage = {
            _id: messageId,
            conversationId: assignedConversationId,
            senderType: "SUPPORT_AGENT",
            senderId: "SYSTEM",
            message: assignmentMessage,
            status: "DELIVERED",
            createdAt: getNextOrderedTimestamp(withoutTyping),
            localKind: "assignment-update",
          };

          persistSystemMessage(assignedMessage);

          return normalizeMessages([...withoutTyping, assignedMessage]);
        });

        systemAutoReplyTimersRef.current = systemAutoReplyTimersRef.current.filter((activeTimerId) => activeTimerId !== timerId);
      }, SYSTEM_AUTO_REPLY_TYPING_MS);

      systemAutoReplyTimersRef.current.push(timerId);
    });

    socket.on("CONVERSATION_ENDED", (payload: LiveChatConversationEndedEvent) => {
      appendEndedMessage(payload);
      stopVisitorTyping(false);
      setIsAgentTyping(false);
      clearAgentTypingTimer();
      openPostChatFeedbackPrompt(payload.conversation?._id || conversationId || "");
      setConversationId("");
      setHasCompletedPreChat(true);
      clearStoredValue(CONVERSATION_ID_KEY);
      setSocketStatus("closed");
      void syncConversationHistory(true);
    });

    return () => {
      stopVisitorTyping();
      setIsAgentTyping(false);
      clearAgentTypingTimer();
      disconnectSocket();
    };
  }, [apiKey, appendEndedMessage, appendQueuePositionMessage, clearAgentTypingTimer, clearPersistedSystemMessages, conversationId, disconnectSocket, isOpen, openPostChatFeedbackPrompt, persistSystemMessage, playIncomingMessageSound, stopVisitorTyping, syncConversationHistory, visitorGreetingName, visitorToken]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      clearSystemAutoReplyTimers();
      latestQueuePositionRef.current = null;
      pendingQueuePositionRef.current = null;
      assignmentNoticeConversationIdRef.current = "";
    }
  }, [clearSystemAutoReplyTimers, conversationId]);

  useEffect(() => {
    if (!isOpen || messages.length === 0) {
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages]);

  useEffect(() => {
    const storedVisitorToken = readStoredValue(VISITOR_TOKEN_KEY);
    if (!storedVisitorToken) {
      writeStoredValue(VISITOR_TOKEN_KEY, visitorToken);
    }

    const storedConversationId = readStoredValue(CONVERSATION_ID_KEY);
    if (storedConversationId && storedConversationId !== conversationId) {
      setConversationId(storedConversationId);
      setHasCompletedPreChat(true);
    }
  }, [conversationId, visitorToken]);

  useEffect(() => {
    return () => {
      clearSystemAutoReplyTimers();
      clearQuickReplyTimer();
      clearVisitorTypingTimer();
      clearAgentTypingTimer();
    };
  }, [clearAgentTypingTimer, clearQuickReplyTimer, clearSystemAutoReplyTimers, clearVisitorTypingTimer]);

  const getVisitorMessageStatus = useCallback((message: WidgetTranscriptMessage) => {
    if (String(message._id || "").startsWith("local-")) {
      return {
        label: "Sending",
        toneClass: "text-white/70",
      };
    }

    if (message.status === "SEEN") {
      return {
        label: "Seen",
        toneClass: "text-cyan-100",
      };
    }

    return {
      label: "Delivered",
      toneClass: "text-white/80",
    };
  }, []);

  const latestVisitorMessageId = useMemo(() => {
    const latestMessage = [...messages].reverse().find((message) => message.senderType === "VISITOR" && !message.localKind);
    return latestMessage ? String(latestMessage._id) : null;
  }, [messages]);

  return (
    <div className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-[70] flex flex-col items-end ${panelSpacingClass}`} style={{ fontFamily: "Sora, Avenir Next, Segoe UI, sans-serif" }}>
      <style>
        {`@keyframes widgetPulseOut {
          0% { transform: scale(1); opacity: 0.2; }
          55% { opacity: 0.07; }
          100% { transform: scale(1.85); opacity: 0; }
        }`}
      </style>

      {shouldRenderPanel ? (
        <div
          className={`relative w-[min(390px,calc(100vw-1rem))] sm:w-[378px] h-[min(640px,calc(100vh-1rem))] sm:h-[588px] overflow-hidden rounded-[24px] border flex flex-col origin-bottom-right transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${theme.shell}`}
          style={{
            opacity: isPanelVisible ? 1 : 0,
            transform: isPanelVisible ? "translateY(0) scale(1)" : "translateY(22px) scale(0.9)",
            filter: isPanelVisible ? "blur(0px)" : "blur(6px)",
            borderColor: isDarkMode ? "rgba(203,213,225,0.45)" : "rgba(148,163,184,0.72)",
            boxShadow: isDarkMode
              ? "0 34px 72px -28px rgba(2,6,23,0.74), 0 0 0 1px rgba(203,213,225,0.22)"
              : "0 30px 62px -30px rgba(15,23,42,0.29), 0 0 0 1px rgba(148,163,184,0.35)",
          }}
        >
          <WidgetHeader
            themeHeader={theme.header}
            headerTitleClass={headerTitleClass}
            headerStatusClass={headerStatusClass}
            headerIconButtonClass={theme.headerIconButton}
            headerMenuPanelClass={theme.headerMenuPanel}
            headerMenuItemClass={theme.headerMenuItem}
            headerMenuItemDestructiveClass={theme.headerMenuItemDestructive}
            headerMenuIconClass={theme.headerMenuIcon}
            headerMenuIconDestructiveClass={theme.headerMenuIconDestructive}
            headerMenuDividerClass={theme.headerMenuDivider}
            isHeaderMenuOpen={isHeaderMenuOpen}
            setHeaderMenuOpen={setIsHeaderMenuOpen}
            headerMenuRef={headerMenuRef}
            title={title}
            widgetLogo={widgetLogo}
            resolvedAccent={resolvedAccent}
            accentSoftBorder={accentSoftBorder}
            accentShadow={accentShadow}
            socketStatus={socketStatus}
            statusLabel={statusLabel}
            isDarkMode={isDarkMode}
            hasActiveConversation={hasActiveConversation}
            onOpenSettings={openSettingsView}
            onOpenHistory={openHistoryView}
            onOpenEndSessionPrompt={openEndSessionPrompt}
            getWidgetInitials={getWidgetInitials}
          />

          {widgetView === "settings" || widgetView === "history" ? (
            <SettingsHistoryPanel
              widgetView={widgetView}
              theme={theme}
              selectedHistoryConversation={selectedHistoryConversation}
              setSelectedHistoryConversationId={setSelectedHistoryConversationId}
              setHistoryMessages={setHistoryMessages}
              setWidgetView={setWidgetView}
              isHistoryTranscriptLoading={isHistoryTranscriptLoading}
              historyMessages={historyMessages}
              messageSizeClass={messageSizeClass}
              isHistoryLoading={isHistoryLoading}
              historyConversations={historyConversations}
              historyError={historyError}
              loadHistoryTranscript={(conversationIdToLoad) => {
                setSelectedHistoryConversationId(conversationIdToLoad);
                void loadHistoryTranscript(conversationIdToLoad);
              }}
              preChatFullName={preChatFullName}
              setPreChatFullName={setPreChatFullName}
              preChatEmailAddress={preChatEmailAddress}
              setPreChatEmailAddress={setPreChatEmailAddress}
              preChatPhoneNumber={preChatPhoneNumber}
              setPreChatPhoneNumber={setPreChatPhoneNumber}
              handleSaveProfile={() => {
                void handleSaveProfile();
              }}
              isProfileSaving={isProfileSaving}
              profileStatusMessage={profileStatusMessage}
              textSize={textSize}
              setTextSize={setTextSize}
              writeStoredValue={writeStoredValue}
              widgetTextSizeKey={WIDGET_TEXT_SIZE_KEY}
              resolvedAccent={resolvedAccent}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              widgetDarkModeKey={WIDGET_DARK_MODE_KEY}
              isMessageSoundsEnabled={isMessageSoundsEnabled}
              setIsMessageSoundsEnabled={setIsMessageSoundsEnabled}
              widgetMessageSoundsKey={WIDGET_MESSAGE_SOUNDS_KEY}
            />
          ) : (
            <ChatPanel
              theme={theme}
              isDarkMode={isDarkMode}
              isLoading={isLoading}
              messages={messages}
              isPreChatPending={isPreChatPending}
              title={title}
              welcomeTitleMessage={welcomeTitleMessage}
              helperTextSizeClass={helperTextSizeClass}
              preChatFullName={preChatFullName}
              setPreChatFullName={setPreChatFullName}
              preChatEmailAddress={preChatEmailAddress}
              setPreChatEmailAddress={setPreChatEmailAddress}
              preChatPhoneNumber={preChatPhoneNumber}
              setPreChatPhoneNumber={setPreChatPhoneNumber}
              browserLocationStatus={browserLocationStatus}
              conversationId={conversationId}
              hasCompletedPreChat={hasCompletedPreChat}
              messageSizeClass={messageSizeClass}
              messageMetaSizeClass={messageMetaSizeClass}
              bubblePaddingClass={bubblePaddingClass}
              avatarSizeClass={avatarSizeClass}
              latestVisitorMessageId={latestVisitorMessageId}
              getVisitorMessageStatus={getVisitorMessageStatus}
              accentHeaderBackground={accentHeaderBackground}
              accentSoftBorder={accentSoftBorder}
              accentShadow={accentShadow}
              resolvedAccent={resolvedAccent}
              isAgentTyping={isAgentTyping}
              bottomRef={bottomRef}
              quickMessages={quickMessages}
              hasEndedConversation={hasEndedConversation}
              hasConversationStarted={hasConversationStarted}
              showQuickMessages={showQuickMessages}
              setShowQuickMessages={setShowQuickMessages}
              isQuickReplyBlocked={isQuickReplyBlocked}
              handleQuickMessageClick={(message) => {
                void handleQuickMessageClick(message);
              }}
              handleGoBackToStart={handleGoBackToStart}
              hasApiKey={hasApiKey}
              hasRuntimeError={hasRuntimeError}
              displayErrorTitle={displayErrorTitle}
              displayErrorMessage={displayErrorMessage}
              handleCompletePreChat={handleCompletePreChat}
              isComposerBlocked={isComposerBlocked}
              composerGapClass={composerGapClass}
              composerButtonSizeClass={composerButtonSizeClass}
              fileInputRef={fileInputRef}
              messageInputRef={messageInputRef}
              messageText={messageText}
              handleComposerTextChange={handleComposerTextChange}
              handleSendMessage={() => {
                void handleSendMessage();
              }}
              inputPaddingClass={inputPaddingClass}
              composerTextClass={composerTextClass}
              isSending={isSending}
              isActionBlocked={isActionBlocked}
            />
          )}

          <EndSessionModal
            isOpen={isEndChatModalOpen}
            hasActiveConversation={hasActiveConversation}
            onClose={() => setIsEndChatModalOpen(false)}
            onEndChat={() => {
              setIsEndChatModalOpen(false);
              setWidgetView("chat");
              void handleEndChat();
            }}
            onEndSession={() => {
              setIsEndChatModalOpen(false);
              void handleEndSession();
            }}
          />

          <FeedbackModal
            isOpen={isFeedbackPromptOpen}
            themeModalBackdrop={theme.modalBackdrop}
            themeModalCard={theme.modalCard}
            themeInput={theme.input}
            themeSettingsMuted={theme.settingsMuted}
            themeModalSecondary={theme.modalSecondary}
            themeModalPrimary={theme.modalPrimary}
            feedbackComment={feedbackComment}
            feedbackRating={feedbackRating}
            feedbackMessage={feedbackMessage}
            isFeedbackSubmitting={isFeedbackSubmitting}
            onCommentChange={setFeedbackComment}
            onRatingChange={setFeedbackRating}
            onSkip={() => closePostChatFeedbackPrompt(true)}
            onSubmit={() => {
              void submitPostChatFeedback();
            }}
          />
        </div>
      ) : null}

      {/* Launcher Button */}
      <LauncherButton
        isOpen={isOpen}
        unreadCount={unreadCount}
        resolvedAccent={resolvedAccent}
        accentShadow={accentShadow}
        widgetLogo={widgetLogo}
        title={title}
        buttonClassName={theme.button}
        onToggle={() => {
          setIsOpen((current) => !current);
          if (!isOpen) {
            setUnreadCount(0);
          }
        }}
      />
    </div>
  );
};

export default LiveChatWidget;
