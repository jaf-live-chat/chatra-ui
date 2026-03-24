import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, Settings, Palette, User, Trash2, Zap, ChevronUp, Paperclip, FileText, Image as ImageIcon, File as FileIcon, Bell, Volume2, Moon, Type, Shield, Check, AlertTriangle, Star } from "lucide-react";

type AttachedFile = {
  name: string;
  url: string;
  type: string;
};

type Message = {
  id: number;
  from: "agent" | "user";
  text: string;
  time: string;
  isAdmin?: boolean;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  files?: AttachedFile[];
};

const initialMessages: Message[] = [];

const WELCOME_MESSAGE = "👋 Hi there! Welcome to JAF Live Chat. How can I help you today?";

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const LiveChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Read widget settings from localStorage
  const [widgetTitle, setWidgetTitle] = useState(() => localStorage.getItem("jaf_widget_title") || "JAF Support");
  const [welcomeMsg, setWelcomeMsg] = useState(() => localStorage.getItem("jaf_welcome_message") || WELCOME_MESSAGE);

  useEffect(() => {
    const sync = () => {
      setWidgetTitle(localStorage.getItem("jaf_widget_title") || "JAF Support");
      setWelcomeMsg(localStorage.getItem("jaf_welcome_message") || WELCOME_MESSAGE);
    };
    window.addEventListener("storage", sync);
    const iv = setInterval(sync, 500);
    return () => { window.removeEventListener("storage", sync); clearInterval(iv); };
  }, []);

  // Listen for external "open-live-chat" event
  useEffect(() => {
    const handleOpenChat = () => {
      setOpen(true);
      setMinimized(false);
    };
    window.addEventListener("open-live-chat", handleOpenChat);
    return () => window.removeEventListener("open-live-chat", handleOpenChat);
  }, []);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [unread, setUnread] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(false);

  // Customization and tracking state
  const [themeColor, setThemeColor] = useState("cyan");
  const [sessionId, setSessionId] = useState("");

  // Settings panel state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [textSize, setTextSize] = useState<"Small" | "Default" | "Large">("Default");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Rating state
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Welcome screen state
  const [conversationStarted, setConversationStarted] = useState(false);

  // Typing indicator state
  const [agentTyping, setAgentTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // File attachment state
  const [attachedFiles, setAttachedFiles] = useState<{ file: File; previewUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollRef = useRef<number | null>(null);
  const lastMessageCountRef = useRef(0);

  const themeColors = {
    cyan: { bg: "bg-[#0891b2]", hover: "hover:bg-[#0e7490]", grad: "linear-gradient(135deg, #0891b2, #0e7490)", text: "text-[#0891b2]", border: "focus:border-[#22d3ee]", ring: "focus:ring-cyan-100", shadow: "0 4px 24px #0891B273" },
    navy: { bg: "bg-[#164e63]", hover: "hover:bg-[#0c3547]", grad: "linear-gradient(135deg, #164e63, #0c3547)", text: "text-[#164e63]", border: "focus:border-[#0e7490]", ring: "focus:ring-cyan-100", shadow: "0 4px 24px #164E6373" },
    teal: { bg: "bg-[#0d9488]", hover: "hover:bg-[#0f766e]", grad: "linear-gradient(135deg, #0d9488, #0f766e)", text: "text-[#0d9488]", border: "focus:border-[#2dd4bf]", ring: "focus:ring-teal-100", shadow: "0 4px 24px #0D948873" },
  };

  const theme = themeColors[themeColor as keyof typeof themeColors];

  // Text size mapping
  const textSizeMap = {
    Small: { message: "text-[12px]", input: "text-[12px]", leading: "leading-relaxed" },
    Default: { message: "text-[14px]", input: "text-sm", leading: "leading-relaxed" },
    Large: { message: "text-[16px]", input: "text-[16px]", leading: "leading-relaxed" },
  };
  const ts = textSizeMap[textSize];

  // Dark mode color helpers
  const dm = {
    widgetBg: darkMode ? "bg-gray-900" : "bg-white",
    widgetBorder: darkMode ? "border-gray-700" : "border-gray-100",
    chatBg: darkMode ? "bg-gray-800" : "bg-gray-50",
    bubbleAgent: darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-gray-800 border-gray-100",
    inputBg: darkMode ? "bg-gray-800 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-800",
    inputWrapperBg: darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100",
    footerBg: darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-50",
    footerText: darkMode ? "text-gray-500" : "text-gray-400",
    settingsBg: darkMode ? "bg-gray-800" : "bg-gray-50",
    settingsText: darkMode ? "text-gray-100" : "text-gray-900",
    settingsSubText: darkMode ? "text-gray-400" : "text-gray-700",
    settingsLabel: darkMode ? "text-gray-500" : "text-gray-400",
    settingsSectionBg: darkMode ? "bg-gray-700" : "bg-gray-100",
    settingsIcon: darkMode ? "text-gray-300" : "text-gray-600",
    settingsBorder: darkMode ? "border-gray-600" : "border-gray-200",
    todayBadgeBg: darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-400",
    placeholder: darkMode ? "placeholder-gray-500" : "placeholder-gray-400",
    attachBtnBg: darkMode ? "bg-gray-700 border-gray-600 hover:bg-gray-600" : "bg-gray-50 border-gray-200 hover:bg-gray-100",
    attachBtnIcon: darkMode ? "text-gray-400" : "text-gray-400",
    quickMsgBg: darkMode ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600",
    quickMsgPanelBg: darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200",
    quickToggleBg: darkMode ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200" : "hover:bg-gray-50 text-gray-400 hover:text-gray-600",
  };

  // Notification sound helper
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio not supported
    }
  };

  // Track previous message count for notification triggers
  const prevMessageCountRef = useRef(messages.length);

  // Sound + Push notification effect
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const newMsgs = messages.slice(prevMessageCountRef.current);
      const hasAgentMsg = newMsgs.some(m => m.from === "agent");
      if (hasAgentMsg) {
        // Play sound if enabled
        if (soundEnabled) {
          playNotificationSound();
        }
        // Browser push if enabled and widget is not focused
        if (pushEnabled && (!open || minimized)) {
          if (Notification.permission === "granted") {
            const lastAgent = newMsgs.filter(m => m.from === "agent").pop();
            new Notification("JAF Live Chat", {
              body: lastAgent?.text || "New message from support",
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💬</text></svg>",
            });
          }
        }
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, soundEnabled, pushEnabled, open, minimized]);

  // Session tracking & message persistence
  useEffect(() => {
    const storedSession = localStorage.getItem("jaf_session_id");
    const sid = storedSession || "VS-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    if (!storedSession) {
      localStorage.setItem("jaf_session_id", sid);
    }
    setSessionId(sid);

    const storedMessages = localStorage.getItem("jaf_messages");
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        if (parsed.length > 0) setMessages(parsed);
      } catch (e) {
        // use default
      }
    }

    // Sync adminReplyCountRef with existing admin replies so we don't re-add them
    try {
      const repliesStored = localStorage.getItem(`jaf_admin_replies_${sid}`);
      if (repliesStored) {
        const replies = JSON.parse(repliesStored);
        adminReplyCountRef.current = replies.length;
      }
    } catch (e) {
      // silently fail
    }

    const storedTheme = localStorage.getItem("jaf_theme");
    if (storedTheme && Object.keys(themeColors).includes(storedTheme)) {
      setThemeColor(storedTheme);
    }

    // Load settings from localStorage
    const storedSound = localStorage.getItem("jaf_sound_enabled");
    if (storedSound) setSoundEnabled(storedSound === "true");

    const storedPush = localStorage.getItem("jaf_push_enabled");
    if (storedPush) setPushEnabled(storedPush === "true");

    const storedDarkMode = localStorage.getItem("jaf_dark_mode");
    if (storedDarkMode) setDarkMode(storedDarkMode === "true");

    const storedTextSize = localStorage.getItem("jaf_text_size");
    if (storedTextSize && ["Small", "Default", "Large"].includes(storedTextSize)) setTextSize(storedTextSize as "Small" | "Default" | "Large");

    const storedConvStarted = localStorage.getItem("jaf_conversation_started");
    if (storedConvStarted === "true") setConversationStarted(true);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      // Strip base64 file URLs before saving to avoid localStorage quota errors
      const messagesForStorage = messages.map(m => {
        if (m.files) {
          return {
            ...m,
            files: m.files.map(f => ({ name: f.name, type: f.type })),
          };
        }
        return m;
      });
      localStorage.setItem("jaf_messages", JSON.stringify(messagesForStorage));

      // Sync visitor chat to shared queue for admin dashboard
      if (sessionId) {
        syncToAdminQueue(sessionId, messages);
      }
    }
  }, [messages, sessionId]);

  useEffect(() => {
    localStorage.setItem("jaf_theme", themeColor);
  }, [themeColor]);

  // Listen for admin theme changes from WidgetSettingsView
  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem("jaf_theme");
      if (newTheme && Object.keys(themeColors).includes(newTheme)) {
        setThemeColor(newTheme);
      }
    };
    window.addEventListener("jaf_theme_changed", handleThemeChange);
    return () => window.removeEventListener("jaf_theme_changed", handleThemeChange);
  }, []);

  // Listen for admin typing indicator via localStorage
  useEffect(() => {
    if (!sessionId) return;

    const checkAdminTyping = () => {
      try {
        const val = localStorage.getItem(`jaf_admin_typing_${sessionId}`);
        if (val) {
          const parsed = JSON.parse(val);
          const elapsed = Date.now() - parsed.timestamp;
          // Typing expires after 3 seconds
          if (elapsed < 3000 && parsed.isTyping) {
            setAgentTyping(true);
          } else {
            setAgentTyping(false);
          }
        }
      } catch (e) {
        // silently fail
      }
    };

    const handleAdminTyping = () => checkAdminTyping();
    window.addEventListener("jaf_admin_typing", handleAdminTyping);

    const interval = setInterval(checkAdminTyping, 800);

    return () => {
      window.removeEventListener("jaf_admin_typing", handleAdminTyping);
      clearInterval(interval);
    };
  }, [sessionId]);

  // Broadcast visitor typing state to admin via localStorage
  const broadcastUserTyping = () => {
    if (!sessionId) return;
    localStorage.setItem(`jaf_visitor_typing_${sessionId}`, JSON.stringify({
      isTyping: true,
      timestamp: Date.now(),
    }));
    window.dispatchEvent(new Event("jaf_visitor_typing"));

    // Clear previous timeout
    if (userTypingTimeoutRef.current) clearTimeout(userTypingTimeoutRef.current);
    userTypingTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(`jaf_visitor_typing_${sessionId}`, JSON.stringify({
        isTyping: false,
        timestamp: Date.now(),
      }));
      window.dispatchEvent(new Event("jaf_visitor_typing"));
    }, 2000);
  };

  useEffect(() => {
    if (open && !showSettings) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, showSettings]);

  useEffect(() => {
    if (open && !minimized && !showSettings) {
      const messageCount = messages.length;
      const hasNewMessages = messageCount > lastMessageCountRef.current;

      if (hasNewMessages || savedScrollRef.current === null) {
        // New messages or first open — scroll to bottom
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
      } else {
        // Restore saved scroll position
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = savedScrollRef.current;
        }
      }

      lastMessageCountRef.current = messageCount;
    }
  }, [messages, open, minimized, showSettings]);

  // Scroll to bottom when typing indicator appears
  useEffect(() => {
    if (agentTyping && open && !minimized && !showSettings) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [agentTyping, open, minimized, showSettings]);

  // Track how many admin replies we've already consumed
  const adminReplyCountRef = useRef(0);

  // Listen for admin replies from the ActiveChatView via localStorage
  useEffect(() => {
    if (!sessionId) return;

    const checkAdminReplies = () => {
      try {
        const key = `jaf_admin_replies_${sessionId}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const replies = JSON.parse(stored);

        if (replies.length > adminReplyCountRef.current) {
          const newReplies = replies.slice(adminReplyCountRef.current);
          adminReplyCountRef.current = replies.length;

          const newMessages: Message[] = newReplies.map((r: any) => ({
            id: Date.now() + Math.random(),
            from: "agent" as const,
            text: r.text,
            time: r.time,
            isAdmin: true,
            ...(r.files ? { files: r.files } : {}),
          }));

          setMessages(prev => [...prev, ...newMessages]);

          // Agent sent a message — clear typing indicator immediately
          setAgentTyping(false);

          // Show unread badge if widget is closed
          if (!open) {
            setUnread(prev => prev + newMessages.length);
          }
        }
      } catch (e) {
        // silently fail
      }
    };

    // Listen for same-tab event
    const handleAdminReply = () => checkAdminReplies();
    window.addEventListener("jaf_admin_reply", handleAdminReply);

    // Poll as fallback
    const interval = setInterval(checkAdminReplies, 1500);

    return () => {
      window.removeEventListener("jaf_admin_reply", handleAdminReply);
      clearInterval(interval);
    };
  }, [sessionId, open]);

  const handleClose = () => {
    // Save scroll position before closing
    if (chatContainerRef.current) {
      savedScrollRef.current = chatContainerRef.current.scrollTop;
    }
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setShowSettings(false);
    }, 200);
  };

  const sendMessage = () => {
    const text = input.trim();
    const hasFiles = attachedFiles.length > 0;
    if (!text && !hasFiles) return;

    const userMsg: Message = {
      id: Date.now(),
      from: "user",
      text: text || (hasFiles ? `📎 ${attachedFiles.map(f => f.file.name).join(", ")}` : ""),
      time: getTime(),
      ...(hasFiles ? {
        files: attachedFiles.map(f => ({
          name: f.file.name,
          url: f.previewUrl,
          type: f.file.type,
        })),
      } : {}),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Immediately clear visitor typing indicator on send
    if (sessionId) {
      if (userTypingTimeoutRef.current) clearTimeout(userTypingTimeoutRef.current);
      localStorage.setItem(`jaf_visitor_typing_${sessionId}`, JSON.stringify({
        isTyping: false,
        timestamp: Date.now(),
      }));
      window.dispatchEvent(new Event("jaf_visitor_typing"));
    }
  };

  const sendQuickMessage = (text: string) => {
    const userMsg: Message = { id: Date.now(), from: "user", text, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setShowQuickMessages(false);

    // Auto-reply from agent after a short delay
    const autoReplies: Record<string, string> = {
      "Hi, I need help with my account.": "Hi there! I'd be happy to help with your account. Could you please share your account email or ID so I can look into it?",
      "How do I upgrade my plan?": "You can upgrade your plan by going to Settings → Billing → Change Plan. Would you like me to walk you through it?",
      "I'm having trouble logging in.": "I'm sorry to hear that! Have you tried resetting your password? You can do so from the login page by clicking 'Forgot Password'.",
      "Can I get a refund?": "I understand. Refund requests are handled by our billing team. Could you provide your invoice number so I can look into this for you?",
      "How do I add team members?": "You can add team members from Settings → Team → Invite Members. Would you like me to guide you through the process?",
    };

    const reply = autoReplies[text] || "Thanks for reaching out! An agent will be with you shortly to assist with your request.";

    // Show typing indicator, then deliver the reply
    setTimeout(() => {
      setAgentTyping(true);
    }, 400);

    const typingDuration = 1200 + Math.random() * 800;
    setTimeout(() => {
      setAgentTyping(false);
      const agentMsg: Message = {
        id: Date.now() + 1,
        from: "agent",
        text: reply,
        time: getTime(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 400 + typingDuration);
  };

  const quickMessages = [
    "Hi, I need help with my account.",
    "How do I upgrade my plan?",
    "I'm having trouble logging in.",
    "Can I get a refund?",
    "How do I add team members?",
    "Where can I find my API keys?",
    "I want to cancel my subscription.",
    "How do I connect a custom domain?",
    "What are the pricing options?",
    "I need help with billing.",
    "Is there a free trial available?",
    "How do I reset my password?",
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  const resetSession = () => {
    // Remove from shared admin queue
    if (sessionId) {
      removeFromAdminQueue(sessionId);
      // Clean up admin replies for this session
      localStorage.removeItem(`jaf_admin_replies_${sessionId}`);
    }
    adminReplyCountRef.current = 0;
    localStorage.removeItem("jaf_messages");
    const newSession = "VS-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    localStorage.setItem("jaf_session_id", newSession);
    setSessionId(newSession);
    setMessages(initialMessages);
    setShowSettings(false);
    setConversationStarted(false);
    setAgentTyping(false);
    localStorage.removeItem("jaf_conversation_started");
    // Clean up typing indicators
    if (sessionId) {
      localStorage.removeItem(`jaf_admin_typing_${sessionId}`);
      localStorage.removeItem(`jaf_visitor_typing_${sessionId}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedFiles(prev => [...prev, {
            file,
            previewUrl: reader.result as string,
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFileRemove = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Chat Window */}
      {(open || closing) && (
        <div
          className={`${dm.widgetBg} rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${dm.widgetBorder} transition-all duration-300 ease-out origin-bottom-right ${minimized ? "scale-95 opacity-0 pointer-events-none" : "scale-100 opacity-100"} ${closing ? "animate-out fade-out zoom-out-95 duration-200" : "animate-in fade-in zoom-in-95 duration-200"}`}
          style={{ width: "360px", height: "520px", position: "relative" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 transition-colors duration-300"
            style={{ background: theme.grad }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  J
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  {widgetTitle}
                </p>
                <p className="text-white/80 text-xs">
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {conversationStarted && (
                <button
                  onClick={() => setShowEndConfirm(true)}
                  className="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors cursor-pointer text-xs font-medium whitespace-nowrap"
                  title="End & Clear Chat"
                >
                  End chat
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg text-white transition-colors cursor-pointer ${showSettings ? 'bg-white/30' : 'hover:bg-white/20'}`}
                title="Widget Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Admin Mode button removed — admin replies from the dashboard */}


            </div>
          </div>

          {showSettings ? (
            /* Settings Panel */
            <div className={`flex-1 overflow-y-auto ${dm.settingsBg}`} style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}>
              {/* Appearance Section */}
              <div className="px-5 pt-5 pb-4">
                {/* Back Button */}
                <button
                  onClick={() => setShowSettings(false)}
                  className={`flex items-center gap-1.5 mb-4 px-2 py-1 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${darkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  Back to chat
                </button>

                {/* Theme Color */}


                {/* Text Size */}
                <div className="mb-1">
                  <p className={`text-[11px] font-medium ${dm.settingsLabel} uppercase tracking-wider mb-2.5`}>Text Size</p>
                  <div className={`flex rounded-xl border ${dm.settingsBorder} p-1 gap-1 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    {(["Small", "Default", "Large"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setTextSize(size);
                          localStorage.setItem("jaf_text_size", size);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${textSize === size
                            ? `${darkMode ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-white'} shadow-sm`
                            : `${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between mt-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Moon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-[13px] ${dm.settingsSubText}`}>Dark Mode</span>
                  </div>
                  <button
                    onClick={() => {
                      setDarkMode(!darkMode);
                      localStorage.setItem("jaf_dark_mode", String(!darkMode));
                    }}
                    className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${darkMode ? 'bg-cyan-600' : 'bg-gray-300'
                      }`}
                  >
                    <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${darkMode ? 'translate-x-[18px]' : 'translate-x-0'
                      }`} />
                  </button>
                </div>
              </div>

              <div className={`mx-5 border-t ${dm.settingsBorder}`} />

              {/* Notifications Section */}
              <div className="px-5 py-4">


                {/* Message Sounds */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-[13px] ${dm.settingsSubText}`}>Message Sounds</span>
                  </div>
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      localStorage.setItem("jaf_sound_enabled", String(!soundEnabled));
                    }}
                    className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${soundEnabled ? 'bg-cyan-600' : 'bg-gray-300'
                      }`}
                  >
                    <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${soundEnabled ? 'translate-x-[18px]' : 'translate-x-0'
                      }`} />
                  </button>
                </div>

                {/* Browser Push */}

              </div>

              <div className={`mx-5 border-t ${dm.settingsBorder}`} />

              {/* Session & Privacy Section */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Session & Privacy</span>
                </div>

                <p className={`text-[12px] leading-relaxed mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  We securely store your session so you don't lose your chat on reload. You can end and clear this session at any time.
                </p>

              </div>


            </div>
          ) : !conversationStarted ? (
            /* Welcome Screen */
            <div className={`flex-1 flex flex-col items-center justify-center px-8 text-center ${dm.chatBg}`}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-5 shadow-lg"
                style={{ backgroundImage: theme.grad }}
              >
                J
              </div>
              <p className={`text-[17px] font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Welcome to {widgetTitle} 👋
              </p>
              <p className={`text-[13px] mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                We're here to help! Ask us anything or share your feedback.
              </p>
              <p className={`text-[12px] mb-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Our team typically replies within a few minutes.
              </p>
              <button
                onClick={() => {
                  setConversationStarted(true);
                  localStorage.setItem("jaf_conversation_started", "true");
                  setAgentTyping(true);
                  setTimeout(() => {
                    setAgentTyping(false);
                    const wMsg: Message = {
                      id: Date.now(),
                      from: "agent",
                      text: welcomeMsg,
                      time: getTime(),
                    };
                    setMessages([wMsg]);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }, 1800);
                }}
                className={`px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 ${theme.bg} ${theme.hover}`}
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Start a conversation
                </span>
              </button>
            </div>
          ) : (
            /* Messages */
            <div ref={chatContainerRef} className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${dm.chatBg}`} style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}>
              <div className="text-center mb-6">
                <span className={`text-xs ${dm.todayBadgeBg} px-3 py-1 rounded-full`}>Today</span>
              </div>

              {messages.map((msg, index) => {
                const isConsecutive = index > 0 && messages[index - 1].from === msg.from;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} ${isConsecutive ? "mt-1" : "mt-4"}`}
                  >
                    <div className={`max-w-[80%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      {msg.from === "agent" && !isConsecutive && (
                        <div className={`w-6 h-6 rounded-full ${theme.bg} flex items-center justify-center text-white text-xs font-bold self-start mb-1`}>
                          J
                        </div>
                      )}
                      {(() => {
                        const hasImages = msg.files?.some(f => f.type?.startsWith("image/") && f.url);
                        const hasNonImages = msg.files?.some(f => !f.type?.startsWith("image/"));
                        const hasText = msg.text && (!msg.files || !msg.text.startsWith("📎"));
                        const fileOnly = !hasText && (hasImages || hasNonImages);

                        return (
                          <>
                            {/* Standalone images — no bubble */}
                            {msg.files && msg.files.filter(f => f.type?.startsWith("image/") && f.url).map((file, i) => (
                              <img
                                key={file.url || `img-${i}`}
                                src={file.url}
                                alt=""
                                className="max-w-full rounded-2xl mb-1.5 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setExpandedImage(file.url)}
                              />
                            ))}

                            {/* Standalone non-image files or images without URL data — no colored bubble */}
                            {msg.files && msg.files.filter(f => !f.type?.startsWith("image/") || !f.url).map((file, i) => (
                              <div key={file.url || file.name || `file-${i}`} className={`flex items-center gap-2 mb-1.5 p-2.5 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                } ${msg.from === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
                                {file.type === "application/pdf" ? (
                                  <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                    <FileText className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                                  </div>
                                ) : file.type?.startsWith("image/") ? (
                                  <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${darkMode ? 'bg-cyan-900/30' : 'bg-cyan-50'}`}>
                                    <ImageIcon className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
                                  </div>
                                ) : (
                                  <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <FileIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[12px] truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {file.name}
                                  </p>
                                  <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {file.type?.startsWith("image/") ? "Image attachment" : "Attachment"}
                                  </p>
                                </div>
                              </div>
                            ))}

                            {/* Text bubble — only when there's actual text */}
                            {!fileOnly && (
                              <div
                                className={`px-3.5 py-2.5 rounded-2xl ${ts.message} ${ts.leading} shadow-sm ${msg.from === "user"
                                    ? `${theme.bg} text-white rounded-tr-sm`
                                    : `${dm.bubbleAgent} border rounded-tl-sm`
                                  }`}
                              >
                                {(!msg.files || !msg.text.startsWith("📎")) && msg.text}
                                {msg.files && msg.text.startsWith("📎") ? null : null}
                              </div>
                            )}
                          </>
                        );
                      })()}
                      {!isConsecutive && (
                        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-[10px] px-1 mt-0.5`}>
                          {msg.time}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {agentTyping && (
                <div className="flex justify-start mt-2">
                  <div className="max-w-[80%] flex flex-col gap-1 items-start">
                    <div className={`w-6 h-6 rounded-full ${theme.bg} flex items-center justify-center text-white text-xs font-bold mb-1`}>
                      J
                    </div>
                    <div className={`px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm ${dm.bubbleAgent} border`}>
                      <div className="flex items-center gap-[5px]">
                        <span className="w-[7px] h-[7px] rounded-full bg-gray-400 animate-[typingBounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
                        <span className="w-[7px] h-[7px] rounded-full bg-gray-400 animate-[typingBounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "200ms" }} />
                        <span className="w-[7px] h-[7px] rounded-full bg-gray-400 animate-[typingBounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "400ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          {!showSettings && conversationStarted && (
            <div className={`px-3 py-3 ${dm.inputWrapperBg} border-t flex flex-col gap-2`}>
              {/* Quick Messages Toggle + Panel */}
              <div className={`rounded-xl transition-all duration-300 overflow-hidden ${showQuickMessages
                  ? `shadow-inner ${dm.quickMsgPanelBg}`
                  : ''
                }`}>
                <button
                  onClick={() => setShowQuickMessages(!showQuickMessages)}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${showQuickMessages
                      ? `${theme.text}`
                      : dm.quickToggleBg
                    }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Quick Messages</span>
                  <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${showQuickMessages ? "rotate-180" : ""}`} />
                </button>

                <div
                  className="transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: showQuickMessages ? '200px' : '0px',
                    opacity: showQuickMessages ? 1 : 0,
                  }}
                >
                  <div className="px-2.5 pt-1.5 pb-2.5 flex flex-wrap justify-center gap-1.5">
                    {quickMessages.slice(0, 5).map((qm, i) => (
                      <button
                        key={`qm-${i}`}
                        onClick={() => sendQuickMessage(qm)}
                        className={`px-3 py-1.5 text-[12px] rounded-full transition-all cursor-pointer active:scale-95 ${dm.quickMsgBg}`}
                      >
                        {qm}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip"
                  multiple
                />
                {/* Attachment button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors cursor-pointer flex-shrink-0 ${dm.attachBtnBg}`}
                  title="Attach file"
                >
                  <Paperclip className={`w-4 h-4 ${dm.attachBtnIcon}`} />
                </button>
                {/* Message input with inline file previews */}
                <div className={`flex-1 border rounded-xl overflow-hidden transition-all ${dm.inputBg} ${theme.border} ${theme.ring}`}>
                  {/* Inline file thumbnails */}
                  {attachedFiles.length > 0 && (
                    <div className="px-3 pt-2.5 pb-1 flex gap-2 flex-wrap">
                      {attachedFiles.map((af, index) => (
                        <div key={index} className="relative group">
                          {af.file.type.startsWith("image/") ? (
                            <img
                              src={af.previewUrl}
                              alt={af.file.name}
                              className={`w-10 h-10 rounded-md object-cover border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-md border flex flex-col items-center justify-center gap-0.5 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                              {af.file.type === "application/pdf" ? (
                                <FileText className="w-5 h-5 text-red-500" />
                              ) : (
                                <FileIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                              )}
                              <span className={`text-[8px] max-w-[48px] truncate px-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{af.file.name.split('.').pop()?.toUpperCase()}</span>
                            </div>
                          )}
                          <button
                            onClick={() => handleFileRemove(index)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer ${darkMode ? 'border-gray-500 hover:border-gray-400' : 'border-gray-300 hover:border-gray-400'}`}
                        title="Add more files"
                      >
                        <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>+</span>
                      </button>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (e.target.value.trim()) broadcastUserTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={attachedFiles.length > 0 ? "Add a message..." : "Type your message..."}
                    className={`w-full bg-transparent px-4 py-2.5 ${ts.input} outline-none ${darkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() && attachedFiles.length === 0}
                  className={`w-10 h-10 ${theme.bg} ${theme.hover} ${darkMode ? 'disabled:bg-gray-700' : 'disabled:bg-gray-200'} disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0`}
                >
                  <Send className="w-4 h-4 text-white disabled:text-gray-400 ml-0.5" />
                </button>
              </div>

              {/* File Preview - removed, now inline above */}
            </div>
          )}

          {/* Powered by */}
          <div className={`text-center py-0.5 ${dm.footerBg} border-t`}>
            <span className={`${dm.footerText} text-[11px] leading-tight`}>
              Powered by <span className={`font-semibold ${theme.text}`}>JAF Live Chat</span>
            </span>
          </div>

          {/* End Chat — Confirmation Overlay */}
          {showEndConfirm && (
            <div className={`absolute inset-0 z-30 flex items-center justify-center ${darkMode ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-[2px] rounded-2xl`}>
              <div className={`mx-6 px-6 py-5 rounded-2xl shadow-xl flex flex-col items-center text-center ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-red-900/40' : 'bg-red-50'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={darkMode ? '#fca5a5' : '#dc2626'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className={`text-[14px] font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>End this conversation?</h3>
                <p className={`text-[12px] mb-4 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your conversation history will be cleared.
                </p>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setShowEndConfirm(false)}
                    className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowEndConfirm(false);
                      setRating(0);
                      setHoveredStar(0);
                      setRatingSubmitted(false);
                      setShowConfirmClear(true);
                    }}
                    className="flex-1 py-2 rounded-xl text-[13px] font-semibold bg-red-500 hover:bg-red-600 text-white transition-all cursor-pointer"
                  >
                    Yes, end chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* End Chat — Rating Overlay */}
          {showConfirmClear && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm rounded-2xl`}>
              {!ratingSubmitted ? (
                <div className="flex flex-col items-center px-8 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4"
                    style={{ backgroundImage: theme.grad }}
                  >
                    J
                  </div>
                  <p className={`text-[15px] font-semibold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Rate your experience
                  </p>
                  <p className={`text-[12px] mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    How was your chat with our agent?
                  </p>

                  {/* Star rating */}
                  <div className="flex gap-1.5 mb-5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${star <= (hoveredStar || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : darkMode ? 'text-gray-600' : 'text-gray-300'
                            }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Rating label */}
                  <p className={`text-[12px] mb-6 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {(hoveredStar || rating) === 1 && 'Poor'}
                    {(hoveredStar || rating) === 2 && 'Fair'}
                    {(hoveredStar || rating) === 3 && 'Good'}
                    {(hoveredStar || rating) === 4 && 'Very Good'}
                    {(hoveredStar || rating) === 5 && 'Excellent'}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        setRating(0);
                        setHoveredStar(0);
                        setRatingSubmitted(true);
                        setTimeout(() => {
                          setShowConfirmClear(false);
                          setRatingSubmitted(false);
                          setRating(0);
                          setHoveredStar(0);
                          setInput('');
                          resetSession();
                        }, 2500);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer shrink-0 ${darkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200'
                        }`}
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => {
                        if (rating > 0) {
                          try {
                            const ratingData = {
                              sessionId,
                              rating,
                              timestamp: new Date().toISOString(),
                            };
                            const stored = localStorage.getItem('jaf_ratings');
                            const ratings = stored ? JSON.parse(stored) : [];
                            ratings.push(ratingData);
                            localStorage.setItem('jaf_ratings', JSON.stringify(ratings));
                          } catch (e) {
                            // silently fail
                          }
                          setRatingSubmitted(true);
                          setTimeout(() => {
                            setShowConfirmClear(false);
                            setRatingSubmitted(false);
                            setRating(0);
                            setHoveredStar(0);
                            setInput('');
                            resetSession();
                          }, 2500);
                        }
                      }}
                      disabled={rating === 0}
                      className={`flex-1 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed ${theme.bg} ${theme.hover}`}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center px-8 text-center">
                  <style>{`
                    @keyframes jaf-check-bounce {
                      0% { transform: scale(0) rotate(-45deg); opacity: 0; }
                      50% { transform: scale(1.2) rotate(0deg); opacity: 1; }
                      70% { transform: scale(0.9); }
                      100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes jaf-fade-up {
                      0% { transform: translateY(12px); opacity: 0; }
                      100% { transform: translateY(0); opacity: 1; }
                    }
                    @keyframes jaf-star-pop {
                      0% { transform: scale(0) rotate(-30deg); opacity: 0; }
                      60% { transform: scale(1.3) rotate(5deg); opacity: 1; }
                      80% { transform: scale(0.9) rotate(-2deg); }
                      100% { transform: scale(1) rotate(0deg); opacity: 1; }
                    }
                    @keyframes jaf-ring-pulse {
                      0% { transform: scale(0.8); opacity: 0.6; }
                      50% { transform: scale(1.5); opacity: 0; }
                      100% { transform: scale(1.5); opacity: 0; }
                    }
                  `}</style>
                  <div className="relative mb-4">
                    <div
                      className={`absolute inset-0 rounded-full ${darkMode ? 'bg-green-400/20' : 'bg-green-200/60'}`}
                      style={{ animation: 'jaf-ring-pulse 1s ease-out forwards' }}
                    />
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center ${darkMode ? 'bg-green-900/40' : 'bg-green-50'}`}
                      style={{ animation: 'jaf-check-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                    >
                      <Check className={`w-7 h-7 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                  </div>
                  <p
                    className={`text-[15px] font-semibold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
                    style={{ animation: 'jaf-fade-up 0.5s ease-out 0.3s both' }}
                  >
                    Thank you!
                  </p>
                  <p
                    className={`text-[12px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    style={{ animation: 'jaf-fade-up 0.5s ease-out 0.45s both' }}
                  >
                    {rating > 0 ? 'Your feedback helps us improve.' : 'Your chat has ended.'}
                  </p>
                  {rating > 0 && (
                    <div
                      className="flex gap-0.5 mt-3"
                      style={{ animation: 'jaf-fade-up 0.4s ease-out 0.55s both' }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : darkMode ? 'text-gray-600' : 'text-gray-300'
                            }`}
                          style={{ animation: `jaf-star-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.6 + i * 0.1}s both` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expanded Image Overlay */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={expandedImage}
            alt=""
            className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Bubble Button */}
      <button
        onClick={() => {
          if (open && minimized) {
            setMinimized(false);
          } else if (open) {
            handleClose();
          } else {
            setOpen(true);
            setMinimized(false);
            setShowSettings(false);
          }
        }}
        className={`relative w-14 h-14 cursor-pointer ${theme.bg} ${theme.hover} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 z-50`}
        style={{ boxShadow: theme.shadow }}
        aria-label="Open live chat"
      >
        {open && !minimized && !closing ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}

        {/* Unread badge */}
        {unread > 0 && (!open || minimized || closing) && (
          <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg" style={{ zIndex: 10 }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}

        {/* Ping ring */}
        {!open && messages.length <= 1 && (
          <span className={`absolute inset-0 rounded-full ${theme.bg} opacity-40 animate-ping pointer-events-none`} />
        )}
      </button>
    </div>
  );
}

// Shared queue helpers for admin dashboard sync via localStorage
function syncToAdminQueue(sessionId: string, messages: Message[]) {
  try {
    const userMessages = messages.filter(m => m.from === "user");
    if (userMessages.length === 0) return;

    const firstUserMsg = userMessages[0];
    const lastUserMsg = userMessages[userMessages.length - 1];
    const stored = localStorage.getItem("jaf_live_queue");
    const queue: any[] = stored ? JSON.parse(stored) : [];

    // Calculate time in queue from first user message
    const startTime = new Date(firstUserMsg.id); // id is Date.now()
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    const timeInQueue = `${diffMins}m ${diffSecs.toString().padStart(2, "0")}s`;

    const existingIndex = queue.findIndex((q: any) => q.sessionId === sessionId);
    const queueEntry = {
      id: `LQ-${sessionId}`,
      sessionId,
      name: `Visitor ${sessionId}`,
      message: lastUserMsg.text,
      status: "Waiting",
      timeInQueue,
      createdAt: firstUserMsg.id,
      messageCount: messages.length,
      messages: messages.map(m => ({
        id: m.id,
        sender: m.from === "user" ? "visitor" : "agent",
        text: m.text,
        timestamp: m.time,
        ...(m.files ? { files: m.files.map(f => ({ name: f.name, type: f.type })) } : {}),
      })),
    };

    if (existingIndex >= 0) {
      queue[existingIndex] = queueEntry;
    } else {
      queue.push(queueEntry);
    }

    localStorage.setItem("jaf_live_queue", JSON.stringify(queue));
    // Dispatch storage event for same-tab listeners
    window.dispatchEvent(new Event("jaf_queue_updated"));
  } catch (e) {
    // silently fail
  }
}

function removeFromAdminQueue(sessionId: string) {
  try {
    const stored = localStorage.getItem("jaf_live_queue");
    if (!stored) return;
    const queue: any[] = JSON.parse(stored);
    const filtered = queue.filter((q: any) => q.sessionId !== sessionId);
    localStorage.setItem("jaf_live_queue", JSON.stringify(filtered));
    window.dispatchEvent(new Event("jaf_queue_updated"));
  } catch (e) {
    // silently fail
  }
}

export default LiveChatWidget;


