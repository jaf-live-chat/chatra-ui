import { AlertCircle, ChevronDown, ChevronUp, Loader2, Mail, MessageCircle, Paperclip, Phone, Send, User, Zap } from "lucide-react";
import type { TextSize, WidgetTranscriptMessage } from "../types";
import { formatTime, getWidgetInitials } from "../helpers";

type WidgetTheme = {
  body: string;
  panel: string;
  muted: string;
  settingsMuted: string;
  settingsCard: string;
  settingsText: string;
  error: string;
  button: string;
  buttonSecondary: string;
  quickBar: string;
  quickDock: string;
  quickDockToggle: string;
  quickDockPanel: string;
  quickDockChip: string;
  bubbleVisitor: string;
  bubbleAgent: string;
  composer: string;
  input: string;
  poweredText: string;
  poweredBrand: string;
  welcomeTitle: string;
};

type QuickMessage = {
  _id: string;
  title: string;
  response: string;
};

type ChatPanelProps = {
  theme: WidgetTheme;
  isDarkMode: boolean;
  isLoading: boolean;
  messages: WidgetTranscriptMessage[];
  isPreChatPending: boolean;
  title: string;
  welcomeTitleMessage: string;
  helperTextSizeClass: string;
  preChatFullName: string;
  setPreChatFullName: (value: string) => void;
  preChatEmailAddress: string;
  setPreChatEmailAddress: (value: string) => void;
  preChatPhoneNumber: string;
  setPreChatPhoneNumber: (value: string) => void;
  browserLocationStatus: string;
  conversationId: string;
  hasCompletedPreChat: boolean;
  messageSizeClass: string;
  messageMetaSizeClass: string;
  bubblePaddingClass: string;
  avatarSizeClass: string;
  latestVisitorMessageId: string | null;
  getVisitorMessageStatus: (message: WidgetTranscriptMessage) => { label: string; toneClass: string };
  accentHeaderBackground: string;
  accentSoftBorder: string;
  accentShadow: string;
  resolvedAccent: string;
  isAgentTyping: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  quickMessages: QuickMessage[];
  hasEndedConversation: boolean;
  hasConversationStarted: boolean;
  showQuickMessages: boolean;
  setShowQuickMessages: (updater: (current: boolean) => boolean) => void;
  isQuickReplyBlocked: boolean;
  handleQuickMessageClick: (message: QuickMessage) => void;
  handleGoBackToStart: () => void;
  hasApiKey: boolean;
  hasRuntimeError: boolean;
  displayErrorTitle: string;
  displayErrorMessage: string;
  handleCompletePreChat: () => void;
  isComposerBlocked: boolean;
  composerGapClass: string;
  composerButtonSizeClass: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
  messageText: string;
  handleComposerTextChange: (value: string) => void;
  handleSendMessage: () => void;
  inputPaddingClass: string;
  composerTextClass: string;
  isSending: boolean;
  isActionBlocked: boolean;
};

const ChatPanel = ({
  theme,
  isDarkMode,
  isLoading,
  messages,
  isPreChatPending,
  title,
  welcomeTitleMessage,
  helperTextSizeClass,
  preChatFullName,
  setPreChatFullName,
  preChatEmailAddress,
  setPreChatEmailAddress,
  preChatPhoneNumber,
  setPreChatPhoneNumber,
  browserLocationStatus,
  conversationId,
  hasCompletedPreChat,
  messageSizeClass,
  messageMetaSizeClass,
  bubblePaddingClass,
  avatarSizeClass,
  latestVisitorMessageId,
  getVisitorMessageStatus,
  accentHeaderBackground,
  accentSoftBorder,
  accentShadow,
  resolvedAccent,
  isAgentTyping,
  bottomRef,
  quickMessages,
  hasEndedConversation,
  hasConversationStarted,
  showQuickMessages,
  setShowQuickMessages,
  isQuickReplyBlocked,
  handleQuickMessageClick,
  handleGoBackToStart,
  hasApiKey,
  hasRuntimeError,
  displayErrorTitle,
  displayErrorMessage,
  handleCompletePreChat,
  isComposerBlocked,
  composerGapClass,
  composerButtonSizeClass,
  fileInputRef,
  messageInputRef,
  messageText,
  handleComposerTextChange,
  handleSendMessage,
  inputPaddingClass,
  composerTextClass,
  isSending,
  isActionBlocked,
}: ChatPanelProps) => {
  return (
    <>
      <div
        className={`relative flex flex-1 flex-col overflow-y-auto rounded-[18px] border px-4 py-4 pb-28 sm:px-5 sm:pb-32 ${theme.body}`}
        style={{
          borderColor: isDarkMode ? "rgba(148,163,184,0.28)" : "rgba(148,163,184,0.34)",
          boxShadow: isDarkMode
            ? "inset 0 0 0 1px rgba(15,23,42,0.42)"
            : "inset 0 0 0 1px rgba(148,163,184,0.18)",
        }}
      >
        {isLoading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Starting your chat session...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className={`rounded-[22px] border px-4 py-5 text-center sm:px-5 sm:py-6 ${theme.panel}`}>
            <div className="flex justify-center">
              <div className={`h-[52px] w-[78px] rounded-full flex items-center justify-center ${isDarkMode ? "bg-cyan-900/25" : "bg-cyan-50"}`}>
                <MessageCircle className="h-6 w-6 text-cyan-600" />
              </div>
            </div>

            <p className={`mt-5 leading-snug ${theme.welcomeTitle} ${helperTextSizeClass}`}>
              {isPreChatPending ? `Welcome to ${title}` : welcomeTitleMessage}
            </p>
            <p className={`mt-2 leading-snug ${theme.muted} ${helperTextSizeClass}`}>
              {isPreChatPending
                ? "We're here to help. Please tell us a bit about yourself to get started."
                : "We're here to help. Send a message to get started."}
            </p>

            {!conversationId && !hasCompletedPreChat ? (
              <div className="mt-6 text-left">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-cyan-600">INTRODUCTION</p>

                <div className="mt-3 space-y-2.5">
                  <label className={`flex items-center gap-2.5 border-b px-1 pb-2 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                    <User className={`h-4 w-4 shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      value={preChatFullName}
                      onChange={(event) => setPreChatFullName(event.target.value)}
                      placeholder="Full name (optional)"
                      className={`w-full bg-transparent text-sm outline-none ${isDarkMode ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
                    />
                  </label>

                  <label className={`flex items-center gap-2.5 border-b px-1 pb-2 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                    <Mail className={`h-4 w-4 shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input
                      type="email"
                      value={preChatEmailAddress}
                      onChange={(event) => setPreChatEmailAddress(event.target.value)}
                      placeholder="Email address (optional)"
                      className={`w-full bg-transparent text-sm outline-none ${isDarkMode ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
                    />
                  </label>

                  <label className={`flex items-center gap-2.5 border-b px-1 pb-2 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                    <Phone className={`h-4 w-4 shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      value={preChatPhoneNumber}
                      onChange={(event) => setPreChatPhoneNumber(event.target.value)}
                      placeholder="Phone number (optional)"
                      className={`w-full bg-transparent text-sm outline-none ${isDarkMode ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
                    />
                  </label>
                </div>

                <p className={`mt-3 text-xs font-medium ${theme.settingsMuted}`}>
                  {browserLocationStatus === "resolved"
                    ? "Location access enabled for this session."
                    : browserLocationStatus === "resolving"
                      ? "Requesting location permission..."
                      : "Location permission not granted."}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => {
              const isTypingQuickReply = message.localKind === "quick-typing" || message.localKind === "system-typing";
              const isVisitorMessage = message.senderType === "VISITOR";
              const visitorMessageStatus = isVisitorMessage && !message.localKind && String(message._id) === latestVisitorMessageId
                ? getVisitorMessageStatus(message)
                : null;

              return (
                <div key={message._id} className={`flex items-end gap-2 ${isVisitorMessage ? "justify-end" : "justify-start"}`}>
                  {!isVisitorMessage ? (
                    <div
                      className={`flex-shrink-0 rounded-full border text-white font-bold flex items-center justify-center ${avatarSizeClass}`}
                      style={{
                        background: accentHeaderBackground,
                        borderColor: accentSoftBorder,
                        boxShadow: accentShadow,
                      }}
                    >
                      {getWidgetInitials(title)}
                    </div>
                  ) : null}
                  <div
                    className={`max-w-[80%] sm:max-w-[74%] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isVisitorMessage ? theme.bubbleVisitor : theme.bubbleAgent}`}
                    style={isVisitorMessage ? { backgroundColor: resolvedAccent, borderColor: accentSoftBorder } : undefined}
                  >
                    {isTypingQuickReply ? (
                      <div className={`${bubblePaddingClass} flex min-h-[42px] items-center gap-1.5`} aria-label="System is typing">
                        <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
                        <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
                        <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
                      </div>
                    ) : (
                      <p className={`${bubblePaddingClass} whitespace-pre-wrap ${messageSizeClass}`}>{message.message}</p>
                    )}
                    <div className={`flex items-center gap-1 px-4 pb-1 ${isVisitorMessage ? "text-white/70" : theme.muted}`}>
                      <p className={messageMetaSizeClass}>{formatTime(message.createdAt)}</p>
                      {visitorMessageStatus ? (
                        <p className={`${messageMetaSizeClass} ${visitorMessageStatus.toneClass}`}>{visitorMessageStatus.label}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}

            {isAgentTyping ? (
              <div className="flex items-end justify-start gap-2">
                <div
                  className={`flex-shrink-0 rounded-full border text-white font-bold flex items-center justify-center ${avatarSizeClass}`}
                  style={{
                    background: accentHeaderBackground,
                    borderColor: accentSoftBorder,
                    boxShadow: accentShadow,
                  }}
                >
                  {getWidgetInitials(title)}
                </div>
                <div className={`max-w-[80%] sm:max-w-[74%] ${theme.bubbleAgent}`}>
                  <div className={`${bubblePaddingClass} flex min-h-[42px] items-center gap-1.5`} aria-label="Support is typing">
                    <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
                  </div>
                  <div className={`px-4 pb-2 ${theme.muted}`}>
                    <p className={messageMetaSizeClass}>Support is typing...</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {quickMessages.length > 0 && !hasEndedConversation && !hasConversationStarted && isPreChatPending ? (
        <div className="absolute bottom-[98px] left-4 right-4 z-30 pointer-events-none sm:bottom-[104px]">
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
                <div className="w-full flex flex-col gap-2">
                  {quickMessages.slice(0, 5).map((qm) => (
                    <button
                      key={qm._id}
                      type="button"
                      onClick={() => {
                        setShowQuickMessages(() => false);
                        handleQuickMessageClick(qm);
                      }}
                      disabled={isQuickReplyBlocked}
                      className={theme.quickDockChip}
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
        <div className={`${theme.quickBar} px-4 py-3 flex-shrink-0 sm:px-5`}>
          <div className={`rounded-2xl border px-3.5 py-3 text-left ${theme.settingsCard}`}>
            <p className={`font-semibold ${theme.settingsText}`}>This session has ended.</p>
            <p className={`mt-1 leading-relaxed ${theme.settingsMuted}`}>Start a new session when ready.</p>
            <button
              type="button"
              onClick={handleGoBackToStart}
              className={`mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold ${theme.button}`}
            >
              Start new session
            </button>
          </div>
        </div>
      ) : null}

      <div className={`border-t px-4 py-3.5 flex-shrink-0 sm:px-5 ${theme.composer}`}>
        {!hasApiKey || hasRuntimeError ? (
          <div className={`mb-3 flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 ${theme.error}`}>
            <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0 text-cyan-600" />
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
              disabled={isActionBlocked}
              className={`w-full rounded-full px-3 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${theme.button}`}
              style={{ backgroundColor: resolvedAccent, boxShadow: `0 16px 34px -16px ${resolvedAccent}` }}
            >
              Start conversation
            </button>

            <p className={`mt-2.5 text-center text-xs font-medium ${theme.poweredText}`}>
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
                className={`flex items-center justify-center rounded-2xl flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${composerButtonSizeClass} ${theme.buttonSecondary}`}
                aria-label="Attach file"
                title="Attach file (coming soon)"
                style={{ backgroundColor: `color-mix(in srgb, ${resolvedAccent} 12%, white)`, borderColor: accentSoftBorder, color: resolvedAccent }}
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" disabled />

              <div className={`flex flex-1 items-end rounded-2xl border-2 px-1 py-1 ${theme.input}`}>
                <textarea
                  ref={messageInputRef}
                  value={messageText}
                  onChange={(event) => handleComposerTextChange(event.target.value)}
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
                      handleSendMessage();
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
                  className={`max-h-[84px] w-full resize-none overflow-y-auto bg-transparent outline-none disabled:opacity-50 ${composerTextClass} ${inputPaddingClass} ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                />
              </div>

              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  if (isComposerBlocked) {
                    return;
                  }

                  handleSendMessage();
                }}
                disabled={isComposerBlocked || !messageText.trim()}
                className={`flex flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${composerButtonSizeClass} ${theme.button}`}
                aria-label="Send message"
                style={{ backgroundColor: resolvedAccent, boxShadow: `0 16px 34px -16px ${resolvedAccent}` }}
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>

            <p className={`mt-2.5 text-center text-xs font-medium ${theme.poweredText}`}>
              Powered by <span className={`font-bold text-[0.65rem] ${theme.poweredBrand}`}>JAF Chatra</span>
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default ChatPanel;
