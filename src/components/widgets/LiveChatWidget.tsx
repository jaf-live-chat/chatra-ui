import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircle, Paperclip, Send, X, Menu, Zap, ChevronUp, ChevronDown, ArrowLeft, Moon, Volume2, Shield, AlertCircle, Save } from "lucide-react";
import type { Socket } from "socket.io-client";
import type {
  LiveChatConversation,
  LiveChatConversationEndedEvent,
  LiveChatMessage,
  LiveChatWidgetConfig,
  LiveChatStartConversationResponse,
} from "../../models/LiveChatModel";
import liveChatWidgetServices from "../../services/liveChatWidgetServices";
import { createLiveChatSocket } from "../../services/liveChatRealtimeClient";

type SocketStatus = "idle" | "connecting" | "connected" | "closed" | "error" | "unsupported";

interface QuickMessage {
  _id: string;
  title: string;
  response: string;
}

type WidgetTranscriptMessage = LiveChatMessage & {
  localKind?: "quick-question" | "quick-typing" | "quick-response";
  quickReplyId?: string;
};

type WidgetView = "chat" | "settings";
type TextSize = "small" | "default" | "large";

type BrowserLocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

type WindowWithLiveChatConfig = Window & {
  LiveChatConfig?: LiveChatWidgetConfig;
};

interface LiveChatWidgetProps {
  initialConfig?: LiveChatWidgetConfig;
}

const VISITOR_TOKEN_KEY = "chat_visitor_token";
const CONVERSATION_ID_KEY = "chat_conversation_id";
const WIDGET_TITLE_KEY = "jaf_widget_title";
const WIDGET_WELCOME_KEY = "jaf_welcome_message";
const WIDGET_LOGO_KEY = "jaf_widget_logo";
const WIDGET_DARK_MODE_KEY = "jaf_dark_mode";
const WIDGET_TEXT_SIZE_KEY = "jaf_text_size";
const WIDGET_MESSAGE_SOUNDS_KEY = "jaf_message_sounds";

type LocationPermissionState = "unknown" | "granted" | "denied" | "unavailable";

const DEFAULT_TITLE = "Support";
const DEFAULT_WELCOME = "Hi there. Welcome to JAF Chatra. How can I help you today?";
const DEFAULT_ACCENT = "#0891b2";
const MESSAGE_PAGE_LIMIT = 100;
const PANEL_CLOSE_ANIMATION_MS = 320;

const isHexColor = (value: string) => /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value.trim());

const readStoredValue = (key: string, fallback = "") => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const writeStoredValue = (key: string, value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors in embedded contexts.
  }
};

const clearStoredValue = (key: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors in embedded contexts.
  }
};

const createVisitorToken = () => {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `visitor-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

const getVisitorToken = () => {
  const existingToken = readStoredValue(VISITOR_TOKEN_KEY);
  if (existingToken) {
    return existingToken;
  }

  const token = createVisitorToken();

  writeStoredValue(VISITOR_TOKEN_KEY, token);
  return token;
};

const getWindowConfig = (): LiveChatWidgetConfig => {
  if (typeof window === "undefined") {
    return {};
  }

  const liveChatWindow = window as WindowWithLiveChatConfig;
  return liveChatWindow.LiveChatConfig || {};
};

const getResolvedConfig = (initialConfig: LiveChatWidgetConfig = {}): LiveChatWidgetConfig => {
  const windowConfig = getWindowConfig();

  return {
    apiKey: initialConfig.apiKey || windowConfig.apiKey || "",
    title: initialConfig.title || readStoredValue(WIDGET_TITLE_KEY, windowConfig.title || DEFAULT_TITLE),
    welcomeMessage: initialConfig.welcomeMessage || readStoredValue(WIDGET_WELCOME_KEY, windowConfig.welcomeMessage || DEFAULT_WELCOME),
    widgetLogo: initialConfig.widgetLogo || readStoredValue(WIDGET_LOGO_KEY, windowConfig.widgetLogo || ""),
    accentColor: initialConfig.accentColor || windowConfig.accentColor || DEFAULT_ACCENT,
    visitorName: initialConfig.visitorName || windowConfig.visitorName || "",
    visitorEmail: initialConfig.visitorEmail || windowConfig.visitorEmail || "",
    visitorPhoneNumber: initialConfig.visitorPhoneNumber || windowConfig.visitorPhoneNumber || "",
    ipAddressConsent: typeof initialConfig.ipAddressConsent === "boolean"
      ? initialConfig.ipAddressConsent
      : (typeof windowConfig.ipAddressConsent === "boolean" ? windowConfig.ipAddressConsent : undefined),
  };
};

const formatTime = (value?: string) => {
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

const normalizeMessages = (messages: WidgetTranscriptMessage[]) => {
  return [...messages].sort((left, right) => {
    const leftTime = new Date(left.createdAt || left.updatedAt || 0).getTime();
    const rightTime = new Date(right.createdAt || right.updatedAt || 0).getTime();
    return leftTime - rightTime;
  });
};

const getErrorMessage = (error: unknown) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Unable to load live chat.";
};

const isConversationNotFoundError = (error: unknown) => {
  const statusCode = (error as { response?: { status?: number } })?.response?.status;
  const message = getErrorMessage(error).toLowerCase();

  return statusCode === 404 || message.includes("conversation not found");
};

const resolveConversationIdFromStart = (response: LiveChatStartConversationResponse) => {
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

const parseTextSizePreference = (value: string): TextSize => {
  if (value === "small" || value === "default" || value === "large") {
    return value;
  }

  return "default";
};

const formatDateTime = (value?: string | null) => {
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

const getWidgetInitials = (value: string) => {
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
  const [visitorToken, setVisitorToken] = useState(() => getVisitorToken());
  const [conversationId, setConversationId] = useState(() => readStoredValue(CONVERSATION_ID_KEY));
  const [messages, setMessages] = useState<WidgetTranscriptMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
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

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const widgetSettingsRequestRef = useRef<Promise<void> | null>(null);
  const quickMessagesRequestRef = useRef<Promise<void> | null>(null);
  const historyRequestRef = useRef<Promise<void> | null>(null);
  const profileRequestRef = useRef<Promise<void> | null>(null);
  const quickReplyTimerRef = useRef<number | null>(null);
  const conversationBootstrapRef = useRef(false);

  const apiKey = String(widgetConfig.apiKey || "").trim();
  const hasApiKey = Boolean(apiKey);
  const title = widgetConfig.title || DEFAULT_TITLE;
  const welcomeMessage = widgetConfig.welcomeMessage || DEFAULT_WELCOME;
  const widgetLogo = widgetConfig.widgetLogo || "";
  const accentColor = widgetConfig.accentColor || DEFAULT_ACCENT;
  const resolvedAccent = isHexColor(accentColor) ? accentColor : DEFAULT_ACCENT;
  const accentHeaderBackground = `linear-gradient(135deg, ${resolvedAccent} 0%, color-mix(in srgb, ${resolvedAccent} 72%, black 28%) 100%)`;
  const accentSoftBackground = `color-mix(in srgb, ${resolvedAccent} 12%, white)`;
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
  const locationPermissionLabel = useMemo(() => {
    if (locationPermissionState === "granted") {
      return "Browser location permission is granted. Location can be attached to new sessions.";
    }

    if (locationPermissionState === "denied") {
      return "Browser location permission is denied. Enable it in browser settings to share location.";
    }

    if (locationPermissionState === "unavailable") {
      return "Location access is unavailable on this browser/device.";
    }

    return "Location permission has not been requested yet.";
  }, [locationPermissionState]);

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

  const syncMessages = useCallback(
    async (targetConversationId: string) => {
      if (!apiKey || !targetConversationId) {
        return;
      }

      const responsePromise = liveChatWidgetServices.getConversationMessages(
        widgetConfig,
        visitorToken,
        targetConversationId,
        { page: 1, limit: MESSAGE_PAGE_LIMIT },
      );

      try {
        const response = await responsePromise;

        setMessages(normalizeMessages(response.messages));
      } catch (error) {
        if (targetConversationId === conversationId && isConversationNotFoundError(error)) {
          setConversationId("");
          clearStoredValue(CONVERSATION_ID_KEY);
          setMessages([]);
          setErrorMessage("");
          return;
        }

        setErrorMessage(getErrorMessage(error));
      }
    },
    [apiKey, conversationId, visitorToken, widgetConfig],
  );

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
      return nextConversationId;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [browserLocation, hasApiKey, locationPermissionState, preChatEmailAddress, preChatFullName, preChatPhoneNumber, syncMessages, visitorToken, widgetConfig]);

  const syncWidgetSettings = useCallback(async () => {
    if (!hasApiKey) {
      return;
    }

    if (widgetSettingsRequestRef.current) {
      return widgetSettingsRequestRef.current;
    }

    widgetSettingsRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getWidgetSettings({ apiKey }, visitorToken);
        const settings = response.widgetSettings;

        setWidgetConfig((currentConfig) => {
          const nextTitle = String(settings.widgetTitle || "").trim();
          const nextWelcomeMessage = String(settings.welcomeMessage || "").trim();
          const nextWidgetLogo = String(settings.widgetLogo || "").trim();
          const nextAccentColor = String(settings.accentColor || "").trim();
          const hasWidgetLogo = Object.prototype.hasOwnProperty.call(settings, "widgetLogo");

          if (nextTitle) {
            writeStoredValue(WIDGET_TITLE_KEY, nextTitle);
          }

          if (nextWelcomeMessage) {
            writeStoredValue(WIDGET_WELCOME_KEY, nextWelcomeMessage);
          }

          if (hasWidgetLogo) {
            if (nextWidgetLogo) {
              writeStoredValue(WIDGET_LOGO_KEY, nextWidgetLogo);
            } else {
              clearStoredValue(WIDGET_LOGO_KEY);
            }
          }

          return {
            ...currentConfig,
            title: nextTitle || currentConfig.title,
            welcomeMessage: nextWelcomeMessage || currentConfig.welcomeMessage,
            widgetLogo: hasWidgetLogo ? nextWidgetLogo : currentConfig.widgetLogo,
            accentColor: nextAccentColor || currentConfig.accentColor,
          };
        });
      } catch {
        // Keep chat usable even when widget settings fail to load.
      } finally {
        widgetSettingsRequestRef.current = null;
      }
    })();

    return widgetSettingsRequestRef.current;
  }, [apiKey, hasApiKey, visitorToken]);

  const syncQuickMessages = useCallback(async () => {
    if (!hasApiKey) {
      setQuickMessages([]);
      return;
    }

    if (quickMessagesRequestRef.current) {
      return quickMessagesRequestRef.current;
    }

    quickMessagesRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getQuickMessages({ apiKey }, visitorToken, {
          page: 1,
          limit: 10,
        });

        setQuickMessages(response.quickMessages || []);
      } catch {
        // Keep chat usable even when quick messages fail to load.
        setQuickMessages([]);
      } finally {
        quickMessagesRequestRef.current = null;
      }
    })();

    return quickMessagesRequestRef.current;
  }, [apiKey, hasApiKey, visitorToken]);

  const syncConversationHistory = useCallback(async () => {
    if (!hasApiKey) {
      setHistoryConversations([]);
      setHistoryCount(0);
      setIsReturningVisitor(false);
      setReturningVisitorName("");
      return;
    }

    if (historyRequestRef.current) {
      return historyRequestRef.current;
    }

    setIsHistoryLoading(true);
    setHistoryError("");

    historyRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getConversationHistory({ apiKey }, visitorToken, {
          page: 1,
          limit: 20,
        });

        setHistoryConversations(response.conversations || []);
        setHistoryCount(response.historyCount || 0);
        setIsReturningVisitor(Boolean(response.isReturningVisitor));
        setReturningVisitorName(String(response.visitor?.name || response.visitor?.fullName || "").trim());
      } catch {
        setHistoryConversations([]);
        setHistoryCount(0);
        setHistoryError("Unable to load chat history.");
      } finally {
        setIsHistoryLoading(false);
        historyRequestRef.current = null;
      }
    })();

    return historyRequestRef.current;
  }, [apiKey, hasApiKey, visitorToken]);

  const syncVisitorProfile = useCallback(async () => {
    if (!hasApiKey) {
      return;
    }

    if (profileRequestRef.current) {
      return profileRequestRef.current;
    }

    profileRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getVisitorProfile({ apiKey }, visitorToken);
        const visitor = response.visitor;

        setPreChatFullName(String(visitor?.name || visitor?.fullName || ""));
        setPreChatEmailAddress(String(visitor?.emailAddress || ""));
        setPreChatPhoneNumber(String(visitor?.phoneNumber || ""));
      } catch {
        // Keep widget usable even if profile fetch fails.
      } finally {
        profileRequestRef.current = null;
      }
    })();

    return profileRequestRef.current;
  }, [apiKey, hasApiKey, visitorToken]);

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

  const loadHistoryTranscript = useCallback(async (targetConversationId: string) => {
    if (!hasApiKey || !targetConversationId) {
      return;
    }

    setSelectedHistoryConversationId(targetConversationId);
    setIsHistoryTranscriptLoading(true);

    try {
      const response = await liveChatWidgetServices.getConversationMessages(
        widgetConfig,
        visitorToken,
        targetConversationId,
        { page: 1, limit: MESSAGE_PAGE_LIMIT },
      );

      setHistoryMessages(normalizeMessages(response.messages));
      setHistoryError("");
    } catch {
      setHistoryMessages([]);
      setHistoryError("Unable to load transcript.");
    } finally {
      setIsHistoryTranscriptLoading(false);
    }
  }, [hasApiKey, visitorToken, widgetConfig]);

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

      setMessages((currentMessages) => normalizeMessages([...currentMessages, optimisticMessage]));
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
    }
  }, [conversationId, hasCompletedPreChat, isSending, messageText, startConversation, syncMessages, visitorToken, widgetConfig]);

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

  const handleCompletePreChat = useCallback(() => {
    setHasCompletedPreChat(true);
    setErrorMessage("");
  }, []);

  const resetConversationState = useCallback(() => {
    clearQuickReplyTimer();
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
    clearStoredValue(CONVERSATION_ID_KEY);
  }, [clearQuickReplyTimer, disconnectSocket]);

  const handleEndChat = useCallback(async () => {
    if (conversationId) {
      try {
        await liveChatWidgetServices.endConversation(widgetConfig, visitorToken, conversationId);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    }

    resetConversationState();
    void syncConversationHistory();
  }, [conversationId, resetConversationState, syncConversationHistory, visitorToken, widgetConfig]);

  const handleGoBackToStart = useCallback(() => {
    resetConversationState();
    setWidgetView("chat");
  }, [resetConversationState]);

  const handleEndSession = useCallback(async () => {
    if (conversationId) {
      try {
        await liveChatWidgetServices.endConversation(widgetConfig, visitorToken, conversationId);
      } catch {
        // Continue logging out even if ending the active chat fails.
      }
    }

    clearQuickReplyTimer();
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
  }, [clearQuickReplyTimer, conversationId, disconnectSocket, visitorToken, widgetConfig]);

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

  const messageSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[12px] leading-5";
    }

    if (textSize === "large") {
      return "text-[16px] leading-7";
    }

    return "text-[13px] leading-6";
  }, [textSize]);

  const messageMetaSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[10px] leading-4";
    }

    if (textSize === "large") {
      return "text-[11px] leading-4";
    }

    return "text-[11px] leading-4";
  }, [textSize]);

  const composerTextClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[12px] leading-5";
    }

    if (textSize === "large") {
      return "text-[15px] leading-6";
    }

    return "text-[13px] leading-6";
  }, [textSize]);

  const bubblePaddingClass = useMemo(() => {
    if (textSize === "small") {
      return "px-[14px] py-[9px]";
    }

    if (textSize === "large") {
      return "px-[18px] py-[12px]";
    }

    return "px-4 py-2.5";
  }, [textSize]);

  const avatarSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "h-9 w-9 text-[11px]";
    }

    if (textSize === "large") {
      return "h-11 w-11 text-sm";
    }

    return "h-[38px] w-[38px] text-[12px]";
  }, [textSize]);

  const quickMessageTextClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[11px]";
    }

    if (textSize === "large") {
      return "text-[14px]";
    }

    return "text-xs";
  }, [textSize]);

  const helperTextSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-xs";
    }

    if (textSize === "large") {
      return "text-sm";
    }

    return "text-[13px]";
  }, [textSize]);

  const panelSpacingClass = useMemo(() => {
    if (textSize === "small") {
      return "gap-3";
    }

    if (textSize === "large") {
      return "gap-5";
    }

    return "gap-4";
  }, [textSize]);

  const headerTitleClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[0.96rem]";
    }

    if (textSize === "large") {
      return "text-[1.15rem]";
    }

    return "text-[1.05rem]";
  }, [textSize]);

  const headerStatusClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[10px] tracking-wide";
    }

    if (textSize === "large") {
      return "text-[11px] tracking-wide";
    }

    return "text-[11px] tracking-wide";
  }, [textSize]);

  const headerButtonClass = useMemo(() => {
    if (textSize === "small") {
      return "px-2.5 py-1 text-xs";
    }

    if (textSize === "large") {
      return "px-4 py-2 text-sm";
    }

    return "px-3 py-1.5 text-sm";
  }, [textSize]);

  const composerGapClass = useMemo(() => {
    if (textSize === "small") {
      return "gap-1.5";
    }

    if (textSize === "large") {
      return "gap-3";
    }

    return "gap-2";
  }, [textSize]);

  const composerButtonSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "h-10 w-10";
    }

    if (textSize === "large") {
      return "h-12 w-12";
    }

    return "h-11 w-11";
  }, [textSize]);

  const inputPaddingClass = useMemo(() => {
    if (textSize === "small") {
      return "px-2 py-1.5";
    }

    if (textSize === "large") {
      return "px-4 py-2.5";
    }

    return "px-3 py-2";
  }, [textSize]);

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
    if (isOpen) {
      setWidgetView("chat");
      setIsEndChatModalOpen(false);
      setShowQuickMessages(false);
      setProfileStatusMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || widgetView !== "settings") {
      return;
    }

    void syncConversationHistory();
    void syncVisitorProfile();
  }, [isOpen, syncConversationHistory, syncVisitorProfile, widgetView]);

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

    void syncWidgetSettings();
    void syncQuickMessages();
    void syncConversationHistory();
    void syncVisitorProfile();

    if (!conversationId) {
      return;
    }

    void syncMessages(conversationId);
  }, [conversationId, hasApiKey, isOpen, syncConversationHistory, syncMessages, syncQuickMessages, syncVisitorProfile, syncWidgetSettings]);

  useEffect(() => {
    if (!apiKey || !conversationId) {
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
    });

    socket.on("disconnect", () => {
      setSocketStatus("closed");
    });

    socket.on("connect_error", () => {
      setSocketStatus("error");
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
            nextMessages[localMessageIndex] = {
              ...nextMessages[localMessageIndex],
              ...incomingMessage,
            };
            return normalizeMessages(nextMessages);
          }
        }

        nextMessages.push(incomingMessage);
        return normalizeMessages(nextMessages);
      });

      if (incomingMessage.senderType !== "VISITOR") {
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

    socket.on("CONVERSATION_ENDED", (payload: LiveChatConversationEndedEvent) => {
      appendEndedMessage(payload);
      setConversationId("");
      setHasCompletedPreChat(true);
      clearStoredValue(CONVERSATION_ID_KEY);
      setSocketStatus("closed");
      void syncConversationHistory();
    });

    return () => {
      disconnectSocket();
    };
  }, [apiKey, appendEndedMessage, conversationId, disconnectSocket, isOpen, playIncomingMessageSound, syncConversationHistory, visitorToken]);

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
      clearQuickReplyTimer();
    };
  }, [clearQuickReplyTimer]);

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

  const theme = isDarkMode
    ? {
      shell: "bg-slate-950/95 border-slate-500/90 text-slate-100 shadow-[0_34px_78px_-30px_rgba(2,6,23,1)] ring-2 ring-cyan-400/25 outline outline-1 outline-white/10 backdrop-blur-xl",
      header: "bg-[linear-gradient(135deg,#0f8fb0_0%,#0284c7_55%,#0f766e_100%)] border-b border-cyan-300/20 text-white shadow-sm",
      panel: "bg-slate-900/80 border-slate-700/90",
      body: "bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.16),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.8)_100%)]",
      subText: "text-cyan-100/90 text-xs font-medium",
      muted: "text-slate-400 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg border border-cyan-500/70 shadow-[0_18px_32px_-22px_rgba(8,145,178,0.95)]",
      bubbleAgent: "bg-slate-800/95 text-slate-100 border border-slate-600/80 rounded-3xl rounded-tl-lg shadow-[0_18px_30px_-24px_rgba(15,23,42,0.95)]",
      composer: "bg-slate-900/96 border-t border-slate-700",
      input: "bg-slate-800/95 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-2xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-700 disabled:cursor-not-allowed",
      buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600/80",
      quickBar: "bg-slate-900/85 border-y border-slate-700/80",
      quickDock: "relative w-full",
      quickDockHeader: "text-slate-200/90 text-[11px] font-semibold tracking-[0.18em]",
      quickDockHint: "text-slate-400 text-[11px]",
      quickDockToggle: "w-full inline-flex items-center justify-center gap-2 rounded-[18px] border border-slate-700/80 bg-slate-900/92 px-4 py-2 text-[11px] font-semibold text-slate-200 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.9)] transition-colors hover:bg-slate-800",
      quickDockPanel: "absolute bottom-full mb-2 left-0 right-0 rounded-[18px] border border-slate-700/80 bg-slate-950/95 px-3 pb-3 pt-2.5 shadow-[0_20px_34px_-24px_rgba(15,23,42,0.95)] backdrop-blur-xl",
      quickDockChip: "w-full rounded-full border border-slate-600/80 bg-slate-800/90 px-3.5 py-2 text-center text-[11px] font-medium text-slate-100 transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed",
      error: "bg-red-950/50 text-red-200 border border-red-900/50",
      welcomeTitle: "text-slate-100 text-sm font-semibold",
      headerAction: "bg-white/15 text-white border border-white/20 hover:bg-white/25",
      settingsSectionTitle: "text-slate-400 text-[11px] font-semibold tracking-[0.18em]",
      settingsDivider: "border-slate-700/80",
      settingsText: "text-slate-100 text-[13px] font-medium",
      settingsMuted: "text-slate-400 text-[11px] leading-5",
      settingsCard: "rounded-[22px] border border-slate-700/70 bg-slate-900/55 px-4 py-3 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.95)] backdrop-blur-md",
      settingsControlShell: "grid grid-cols-3 rounded-2xl border p-1 shadow-inner",
      settingsControlShellTone: "border-slate-700 bg-slate-800/80",
      settingsControlActive: "bg-cyan-600 text-white shadow",
      settingsControlIdle: "text-slate-300 hover:bg-slate-700/70",
      toggleOff: "bg-slate-600",
      toggleOn: "bg-cyan-600",
      modalBackdrop: "bg-slate-950/68",
      modalCard: "bg-slate-900 border border-slate-700 shadow-2xl",
      modalPrimary: "bg-red-500 hover:bg-red-600 text-white",
      modalSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
      poweredText: "text-slate-300",
      poweredBrand: "text-cyan-300",
    }
    : {
      shell: "bg-white/96 border-cyan-300 text-slate-900 shadow-[0_34px_74px_-30px_rgba(8,145,178,0.5)] ring-2 ring-cyan-100 outline outline-1 outline-cyan-200/90 backdrop-blur-xl",
      header: "bg-[linear-gradient(135deg,#0891b2_0%,#0ea5e9_58%,#0d9488_100%)] border-b border-cyan-200/80 text-white shadow-sm",
      panel: "bg-white border-slate-200 shadow-md",
      body: "bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.08),_transparent_42%),linear-gradient(180deg,#f8fbfc_0%,#eef5f8_100%)]",
      subText: "text-slate-600 text-xs font-medium",
      muted: "text-slate-500 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg border border-cyan-500/80 shadow-[0_16px_28px_-22px_rgba(8,145,178,0.65)]",
      bubbleAgent: "bg-white text-slate-900 border border-slate-300 rounded-3xl rounded-tl-lg shadow-[0_16px_26px_-24px_rgba(15,23,42,0.35)]",
      composer: "bg-white border-t border-slate-200",
      input: "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-2xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-200 disabled:cursor-not-allowed",
      buttonSecondary: "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200",
      quickBar: "bg-white/92 border-y border-slate-200",
      quickDock: "relative w-full",
      quickDockHeader: "text-slate-500 text-[11px] font-semibold tracking-[0.18em]",
      quickDockHint: "text-slate-500 text-[11px]",
      quickDockToggle: "w-full inline-flex items-center justify-center gap-2 rounded-[18px] border border-slate-200 bg-white/96 px-4 py-2 text-[11px] font-semibold text-cyan-700 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.16)] transition-colors hover:bg-white",
      quickDockPanel: "absolute bottom-full mb-2 left-0 right-0 rounded-[18px] border border-slate-200 bg-white/98 px-3 pb-3 pt-2.5 shadow-[0_20px_34px_-24px_rgba(15,23,42,0.2)] backdrop-blur-xl",
      quickDockChip: "w-full rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-center text-[11px] font-medium text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed",
      error: "bg-red-50 text-red-700 border border-red-200",
      welcomeTitle: "text-slate-800 text-sm font-semibold",
      headerAction: "bg-white/90 text-cyan-700 border border-cyan-100 hover:bg-white",
      settingsSectionTitle: "text-slate-500 text-[11px] font-semibold tracking-[0.18em]",
      settingsDivider: "border-slate-200",
      settingsText: "text-slate-800 text-[13px] font-medium",
      settingsMuted: "text-slate-500 text-[11px] leading-5",
      settingsCard: "rounded-[22px] border border-slate-200 bg-white/88 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.28)] backdrop-blur-md",
      settingsControlShell: "grid grid-cols-3 rounded-2xl border p-1 shadow-inner",
      settingsControlShellTone: "border-slate-200 bg-slate-100/90",
      settingsControlActive: "bg-white text-slate-900 border border-slate-300 shadow-sm",
      settingsControlIdle: "text-slate-500 hover:bg-white",
      toggleOff: "bg-slate-300",
      toggleOn: "bg-cyan-600",
      modalBackdrop: "bg-slate-900/45",
      modalCard: "bg-white border border-slate-200 shadow-2xl",
      modalPrimary: "bg-red-500 hover:bg-red-600 text-white",
      modalSecondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
      poweredText: "text-slate-500",
      poweredBrand: "text-cyan-700",
    };

  return (
    <div className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-[70] flex flex-col items-end ${panelSpacingClass}`} style={{ fontFamily: "Sora, Avenir Next, Segoe UI, sans-serif" }}>
      {shouldRenderPanel ? (
        <div
          className={`relative w-[min(390px,calc(100vw-1rem))] sm:w-[378px] h-[min(640px,calc(100vh-1rem))] sm:h-[588px] overflow-hidden rounded-[24px] border-2 flex flex-col origin-bottom-right transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${theme.shell}`}
          style={{
            opacity: isPanelVisible ? 1 : 0,
            transform: isPanelVisible ? "translateY(0) scale(1)" : "translateY(22px) scale(0.9)",
            filter: isPanelVisible ? "blur(0px)" : "blur(6px)",
          }}
        >
          <div
            className={`${theme.header} px-5 py-4 flex items-center justify-between gap-3 flex-shrink-0`}
            style={{ background: accentHeaderBackground }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-11 w-11 rounded-full bg-white/20 border border-white/35 flex items-center justify-center overflow-hidden text-white text-lg font-semibold shrink-0">
                {widgetLogo ? (
                  <img
                    src={widgetLogo}
                    alt={`${title} logo`}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span>{getWidgetInitials(title)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold leading-tight truncate whitespace-nowrap ${headerTitleClass}`}>{title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${socketStatus === "connected" ? "bg-emerald-400 animate-pulse" : socketStatus === "connecting" ? "bg-yellow-300" : "bg-emerald-400 animate-pulse"}`} />
                  <p className={`${theme.subText} ${headerStatusClass}`}>{statusLabel}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {conversationId && (
                <button
                  type="button"
                  onClick={() => setIsEndChatModalOpen(true)}
                  className={`rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap ${theme.headerAction} ${headerButtonClass}`}
                >
                  End Chat
                </button>
              )}
              <button
                type="button"
                onClick={() => setWidgetView((current) => (current === "settings" ? "chat" : "settings"))}
                className="h-9 w-9 rounded-lg border border-white/30 bg-white/10 text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
                aria-label="Toggle menu"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-9 w-9 rounded-lg border border-white/30 bg-white/10 text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
                aria-label="Close live chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {widgetView === "settings" ? (
            <>
              <div className={`flex-1 overflow-y-auto px-5 py-5 ${theme.body}`}>
                {selectedHistoryConversation ? (
                  <div className="h-full flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHistoryConversationId("");
                        setHistoryMessages([]);
                      }}
                      className={`inline-flex items-center gap-2 text-[11px] font-semibold mb-4 transition-colors ${theme.settingsText}`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>

                    <div className={`${theme.settingsCard} flex-1 min-h-0 p-4 sm:p-5`}>
                      {isHistoryTranscriptLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <p className={theme.settingsMuted}>Loading transcript...</p>
                        </div>
                      ) : historyMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className={theme.settingsMuted}>No messages found in this conversation.</p>
                        </div>
                      ) : (
                        <div className="h-full overflow-y-auto space-y-2 pr-1">
                          {historyMessages.map((message) => (
                            <div
                              key={message._id}
                              className={`rounded-xl px-3 py-2 ${message.senderType === "VISITOR" ? "bg-cyan-50 border border-cyan-100" : "bg-slate-100 border border-slate-200"}`}
                            >
                              <p className="text-[10px] font-semibold tracking-wide text-slate-500">
                                {message.senderType === "VISITOR" ? "You" : "Support"}
                              </p>
                              <p className={`mt-0.5 whitespace-pre-wrap ${messageSizeClass}`}>{message.message}</p>
                              <p className={`mt-1 ${theme.settingsMuted}`}>{formatDateTime(message.createdAt)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setWidgetView("chat")}
                      className={`inline-flex items-center gap-2 text-[11px] font-semibold mb-4 transition-colors ${theme.settingsText}`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to chat</span>
                    </button>

                    <div className={theme.settingsCard}>
                      <p className={`${theme.settingsSectionTitle} mb-2`}>PROFILE</p>
                      <div className="grid gap-2.5">
                        <input
                          type="text"
                          value={preChatFullName}
                          onChange={(event) => setPreChatFullName(event.target.value)}
                          placeholder="Full name"
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                        />
                        <input
                          type="email"
                          value={preChatEmailAddress}
                          onChange={(event) => setPreChatEmailAddress(event.target.value)}
                          placeholder="Email address"
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                        />
                        <input
                          type="text"
                          value={preChatPhoneNumber}
                          onChange={(event) => setPreChatPhoneNumber(event.target.value)}
                          placeholder="Phone number"
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void handleSaveProfile();
                        }}
                        disabled={isProfileSaving}
                        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: resolvedAccent }}
                      >
                        {isProfileSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        <span>{isProfileSaving ? "Saving..." : "Save profile"}</span>
                      </button>
                      {profileStatusMessage ? (
                        <p className={`mt-2 ${theme.settingsMuted}`}>{profileStatusMessage}</p>
                      ) : null}
                    </div>

                    <div className={`my-5 border-t ${theme.settingsDivider}`} />

                    <div className={theme.settingsCard}>
                      <p className={`${theme.settingsSectionTitle} mb-2`}>TEXT SIZE</p>
                      <div className={`${theme.settingsControlShell} ${theme.settingsControlShellTone}`}>
                        {(["small", "default", "large"] as TextSize[]).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setTextSize(size);
                              writeStoredValue(WIDGET_TEXT_SIZE_KEY, size);
                            }}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${textSize === size ? theme.settingsControlActive : theme.settingsControlIdle}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={`my-5 border-t ${theme.settingsDivider}`} />

                    <div className={`flex items-center justify-between ${theme.settingsCard}`}>
                      <div className="flex items-center gap-2.5">
                        <Moon className={`h-4.5 w-4.5 ${theme.settingsMuted}`} />
                        <p className={theme.settingsText}>Dark Mode</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isDarkMode;
                          setIsDarkMode(next);
                          writeStoredValue(WIDGET_DARK_MODE_KEY, String(next));
                        }}
                        className={`relative h-7 w-14 rounded-full transition-colors ${isDarkMode ? theme.toggleOn : theme.toggleOff}`}
                        aria-label="Toggle dark mode"
                      >
                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${isDarkMode ? "left-8" : "left-1"}`} />
                      </button>
                    </div>

                    <div className={`my-5 border-t ${theme.settingsDivider}`} />

                    <div className={`flex items-center justify-between ${theme.settingsCard}`}>
                      <div className="flex items-center gap-2.5">
                        <Volume2 className={`h-4.5 w-4.5 ${theme.settingsMuted}`} />
                        <p className={theme.settingsText}>Message Sounds</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMessageSoundsEnabled((current) => {
                            const next = !current;
                            writeStoredValue(WIDGET_MESSAGE_SOUNDS_KEY, String(next));
                            return next;
                          });
                        }}
                        className={`relative h-7 w-14 rounded-full transition-colors ${isMessageSoundsEnabled ? theme.toggleOn : theme.toggleOff}`}
                        aria-label="Toggle message sounds"
                      >
                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${isMessageSoundsEnabled ? "left-8" : "left-1"}`} />
                      </button>
                    </div>

                    <div className={`my-5 border-t ${theme.settingsDivider}`} />

                    <div className={theme.settingsCard}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`${theme.settingsSectionTitle} mb-1`}>LOCATION PERMISSION</p>
                          <p className={`${theme.settingsMuted}`}>{locationPermissionLabel}</p>
                        </div>
                        <button
                          type="button"
                          onClick={requestBrowserLocation}
                          disabled={browserLocationStatus === "resolving"}
                          className="rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ backgroundColor: resolvedAccent }}
                        >
                          {browserLocationStatus === "resolving" ? "Checking..." : "Check"}
                        </button>
                      </div>
                    </div>

                    <div className={`my-5 border-t ${theme.settingsDivider}`} />

                    <div className={theme.settingsCard}>
                      <div className="flex items-center justify-between gap-3">
                        <p className={`${theme.settingsSectionTitle}`}>CHAT HISTORY</p>
                        <span className={`${theme.settingsMuted}`}>{historyCount} ended chat{historyCount === 1 ? "" : "s"}</span>
                      </div>

                      {isHistoryLoading ? (
                        <p className={`mt-2 ${theme.settingsMuted}`}>Loading chat history...</p>
                      ) : historyConversations.length === 0 ? (
                        <p className={`mt-2 ${theme.settingsMuted}`}>No previous conversations found for this visitor.</p>
                      ) : (
                        <div className="mt-3 grid gap-2">
                          {historyConversations.slice(0, 6).map((conversation) => {
                            const conversationLabel = formatDateTime(conversation.closedAt || conversation.updatedAt || conversation.createdAt) || "Ended conversation";
                            const isSelected = String(conversation._id) === selectedHistoryConversationId;

                            return (
                              <button
                                key={conversation._id}
                                type="button"
                                onClick={() => {
                                  void loadHistoryTranscript(String(conversation._id));
                                }}
                                className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${isSelected ? "border-cyan-400 bg-cyan-50/80" : "border-slate-300 hover:bg-slate-50"}`}
                              >
                                <p className={`text-xs font-semibold ${theme.settingsText}`}>{conversationLabel}</p>
                                <p className={`mt-0.5 text-[11px] ${theme.settingsMuted}`}>Transcript only</p>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {historyError ? (
                        <p className="mt-2 text-xs text-red-500">{historyError}</p>
                      ) : null}
                    </div>

                    <div className={`my-5 border-t ${theme.settingsDivider}`} />

                    <div className={theme.settingsCard}>
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className={`h-4.5 w-4.5 ${theme.settingsMuted}`} />
                        <p className={`font-semibold tracking-wide ${theme.settingsText}`}>SESSION</p>
                      </div>
                      <p className={`leading-relaxed ${theme.settingsMuted}`}>
                        End session logs out this visitor profile on this browser. End chat only closes the current chat.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          void handleEndSession();
                        }}
                        className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold text-white"
                        style={{ backgroundColor: resolvedAccent }}
                      >
                        End session
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className={`border-t ${theme.composer} px-4 py-3.5 flex-shrink-0`}>
                <p className={`text-xs text-center font-medium ${theme.poweredText}`}>
                  Powered by <span className={`font-bold text-[0.65rem] ${theme.poweredBrand}`}>JAF Chatra</span>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Messages Area */}
              <div className={`flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col relative pb-28 sm:pb-32 ${theme.body}`}>
                {isLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Starting your chat session...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className={`rounded-[22px] border-2 px-4 py-5 sm:px-5 sm:py-6 text-center ${theme.panel}`}>
                    <div className="flex justify-center">
                      <div className="h-[54px] w-[54px] rounded-full bg-slate-200/90 dark:bg-slate-700/60 flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-cyan-600" />
                      </div>
                    </div>

                    <p className={`mt-5 ${theme.welcomeTitle} ${helperTextSizeClass} leading-snug`}>{welcomeTitleMessage}</p>
                    <p className={`mt-2 ${theme.muted} ${helperTextSizeClass} leading-snug`}>We&apos;re here to help. Send a message to get started.</p>

                    {!conversationId && !hasCompletedPreChat ? (
                      <>
                        <div className={`my-4 border-t ${theme.settingsDivider}`} />
                        <div className="text-left">
                          <p className={`font-semibold ${theme.settingsText}`}>Before we start (first visit, optional)</p>
                          <p className={`mt-1 leading-relaxed ${theme.settingsMuted}`}>
                            Share profile details for faster support. You can leave everything blank and continue.
                          </p>

                          <div className="mt-3 grid gap-2.5">
                            <input
                              type="text"
                              value={preChatFullName}
                              onChange={(event) => setPreChatFullName(event.target.value)}
                              placeholder="Full name (optional)"
                              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                            />
                            <input
                              type="email"
                              value={preChatEmailAddress}
                              onChange={(event) => setPreChatEmailAddress(event.target.value)}
                              placeholder="Email address (optional)"
                              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                            />
                            <input
                              type="text"
                              value={preChatPhoneNumber}
                              onChange={(event) => setPreChatPhoneNumber(event.target.value)}
                              placeholder="Phone number (optional)"
                              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                            />
                          </div>

                          <p className={`mt-3 text-xs font-medium ${theme.settingsMuted}`}>
                            {browserLocationStatus === "resolved"
                              ? "Location access enabled for this session."
                              : browserLocationStatus === "resolving"
                                ? "Requesting location permission..."
                                : "Location access is off. Chat will continue without location data."}
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map((message) => {
                      const isTypingQuickReply = message.localKind === "quick-typing";
                      const isVisitorMessage = message.senderType === "VISITOR";
                      const visitorMessageStatus = isVisitorMessage && !message.localKind && String(message._id) === latestVisitorMessageId
                        ? getVisitorMessageStatus(message)
                        : null;
                      return (
                        <div key={message._id} className={`flex ${isVisitorMessage ? "justify-end" : "justify-start"} items-end gap-2`}>
                          {!isVisitorMessage && (
                            <div
                              className={`flex-shrink-0 rounded-full border flex items-center justify-center text-white font-bold ${avatarSizeClass}`}
                              style={{
                                background: accentHeaderBackground,
                                borderColor: accentSoftBorder,
                                boxShadow: accentShadow,
                              }}
                            >
                              {getWidgetInitials(title)}
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] sm:max-w-[74%] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isVisitorMessage ? theme.bubbleVisitor : theme.bubbleAgent}`}
                            style={isVisitorMessage ? { backgroundColor: resolvedAccent, borderColor: accentSoftBorder } : undefined}
                          >
                            {isTypingQuickReply ? (
                              <div className={`${bubblePaddingClass} flex items-center gap-1.5 min-h-[42px]`} aria-label="System is typing">
                                <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
                                <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
                                <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
                              </div>
                            ) : (
                              <p className={`${bubblePaddingClass} whitespace-pre-wrap ${messageSizeClass}`}>{message.message}</p>
                            )}
                            <div className={`px-4 pb-1 flex items-center gap-1 ${isVisitorMessage ? "text-white/70" : theme.muted}`}>
                              <p className={messageMetaSizeClass}>{formatTime(message.createdAt)}</p>
                              {visitorMessageStatus ? (
                                <>
                                  <p className={`${messageMetaSizeClass} ${visitorMessageStatus.toneClass}`}>
                                    {visitorMessageStatus.label}
                                  </p>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}

              </div>

              {quickMessages.length > 0 && !hasEndedConversation && !hasConversationStarted && isPreChatPending ? (
                <div className="absolute bottom-[98px] sm:bottom-[104px] left-4 right-4 z-30 pointer-events-none">
                  <div className={`${theme.quickDock} pointer-events-auto`}>
                    <button
                      type="button"
                      onClick={() => setShowQuickMessages((current) => !current)}
                      disabled={isQuickReplyBlocked}
                      className={`${theme.quickDockToggle} disabled:cursor-not-allowed disabled:opacity-60`}
                      aria-expanded={showQuickMessages}
                    >
                      <Zap className="h-4 w-4" />
                      <span className="leading-none">Quick Messages</span>
                      {showQuickMessages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showQuickMessages ? (
                      <div className={`${theme.quickDockPanel} transition-all duration-200 ease-out`}>
                        <div className="flex flex-col gap-2 w-full">
                          {quickMessages.slice(0, 5).map((qm) => (
                            <button
                              key={qm._id}
                              type="button"
                              onClick={() => {
                                setShowQuickMessages(false);
                                void handleQuickMessageClick(qm);
                              }}
                              disabled={isQuickReplyBlocked}
                              className={theme.quickDockChip}
                              style={{ borderColor: accentSoftBorder }}
                            >
                              {qm.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {hasEndedConversation ? (
                <div className={`${theme.quickBar} px-4 sm:px-5 py-3 flex-shrink-0`}>
                  <div className={`rounded-2xl border px-3.5 py-3 text-left ${theme.settingsCard}`}>
                    <p className={`font-semibold ${theme.settingsText}`}>This session has ended.</p>
                    <p className={`mt-1 leading-relaxed ${theme.settingsMuted}`}>
                      Start a new session when ready.
                    </p>
                    <button
                      type="button"
                      onClick={handleGoBackToStart}
                      className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold text-white"
                      style={{ backgroundColor: resolvedAccent }}
                    >
                      Start new session
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Input Area */}
              <div className={`border-t ${theme.composer} px-4 sm:px-5 py-3.5 flex-shrink-0`}>
                {!hasApiKey || hasRuntimeError ? (
                  <div className={`mb-3 rounded-2xl border px-3.5 py-3 ${theme.error} flex items-start gap-2.5`}>
                    <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" style={{ color: resolvedAccent }} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide">{displayErrorTitle}</p>
                      <p className="mt-1 text-xs leading-relaxed">{displayErrorMessage}</p>
                    </div>
                  </div>
                ) : null}

                {isPreChatPending ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCompletePreChat}
                      disabled={!hasApiKey || hasRuntimeError || isLoading}
                      className="w-full rounded-full px-3 py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: resolvedAccent }}
                    >
                      Start chat
                    </button>

                    <p className={`text-xs mt-2.5 text-center font-medium ${theme.poweredText}`}>
                      Powered by <span className={`font-bold text-[0.65rem] ${theme.poweredBrand}`}>JAF Chatra</span>
                    </p>
                  </>
                ) : (
                  <>
                    <div className={`flex items-end ${composerGapClass}`}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isComposerBlocked}
                        className={`flex ${composerButtonSizeClass} items-center justify-center rounded-2xl flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 ${theme.buttonSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label="Attach file"
                        title="Attach file (coming soon)"
                        style={{ backgroundColor: accentSoftBackground, borderColor: accentSoftBorder, color: resolvedAccent }}
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        disabled
                      />

                      <div className={`flex-1 rounded-2xl border-2 px-1 py-1 ${theme.input} flex items-end`}>
                        <textarea
                          ref={messageInputRef}
                          value={messageText}
                          onChange={(event) => setMessageText(event.target.value)}
                          rows={1}
                          onInput={(event) => {
                            const target = event.currentTarget;
                            target.style.height = "auto";
                            target.style.height = `${Math.min(target.scrollHeight, 84)}px`;
                          }}
                          onKeyDown={(event) => {
                            if (isComposerBlocked) {
                              return;
                            }

                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              void handleSendMessage();
                            }
                          }}
                          placeholder={
                            hasApiKey
                              ? (hasRuntimeError
                                ? "Resolve the error to continue chatting..."
                                : (hasEndedConversation
                                  ? "This chat has ended. Tap Go back to start again..."
                                  : (isPreChatPending ? "Complete the optional pre-chat step to continue..." : "Type a message...")))
                              : "Widget apiKey is missing..."
                          }
                          disabled={isComposerBlocked}
                          className={`w-full bg-transparent ${composerTextClass} outline-none ${inputPaddingClass} disabled:opacity-50 resize-none overflow-y-auto max-h-[84px] ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isComposerBlocked) {
                            return;
                          }

                          void handleSendMessage();
                        }}
                        disabled={isComposerBlocked || !messageText.trim()}
                        className={`flex ${composerButtonSizeClass} flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-200 hover:-translate-y-0.5 ${theme.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                        style={{ backgroundColor: resolvedAccent, boxShadow: accentShadow }}
                        aria-label="Send message"
                      >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </button>
                    </div>

                    <p className={`text-xs mt-2.5 text-center font-medium ${theme.poweredText}`}>
                      Powered by <span className={`font-bold text-[0.65rem] ${theme.poweredBrand}`}>JAF Chatra</span>
                    </p>
                  </>
                )}
              </div>
            </>
          )}

          {isEndChatModalOpen ? (
            <div className={`absolute inset-0 z-40 backdrop-blur-[5px] ${theme.modalBackdrop} flex items-center justify-center p-4`}>
              <div className={`w-full max-w-[320px] rounded-3xl p-5 ${theme.modalCard}`}>
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </div>

                <h3 className="text-center text-xl font-semibold">End this chat?</h3>
                <p className={`text-center mt-2 text-sm ${theme.settingsMuted}`}>
                  This closes your current chat. Your visitor profile and session remain signed in.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEndChatModalOpen(false)}
                    className={`h-11 rounded-2xl text-base font-semibold transition-colors ${theme.modalSecondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleEndChat();
                      setIsEndChatModalOpen(false);
                      setWidgetView("chat");
                    }}
                    className={`h-11 rounded-2xl text-base font-semibold transition-colors ${theme.modalPrimary}`}
                  >
                    Yes, end chat
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) {
            setUnreadCount(0);
          }
        }}
        className={`group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-white/30 text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 ${theme.button}`}
        style={{
          background: accentHeaderBackground,
          boxShadow: accentShadow,
        }}
        aria-label="Open live chat"
      >
        {isOpen ? <X className="h-5 w-5 transition-transform duration-200" /> : <MessageCircle className="h-5 w-5 transition-transform duration-200 group-hover:rotate-6" />}

        {unreadCount > 0 && !isOpen ? (
          <span className="absolute -right-3 -top-3 flex min-w-[24px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
    </div>
  );
};

export default LiveChatWidget;
