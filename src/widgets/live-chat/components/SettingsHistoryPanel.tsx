import { ArrowLeft, ChevronRight, Loader2, Moon, Save, Volume2 } from "lucide-react";
import type { LiveChatConversation } from "../../../models/LiveChatModel";
import { formatDateOnly, formatDateTime, getConversationPreview } from "../helpers";
import type { TextSize, WidgetTranscriptMessage, WidgetView } from "../types";

type WidgetTheme = {
  body: string;
  composer: string;
  poweredText: string;
  poweredBrand: string;
  settingsCard: string;
  settingsText: string;
  settingsMuted: string;
  settingsSectionTitle: string;
  settingsDivider: string;
  settingsControlShell: string;
  settingsControlShellTone: string;
  settingsControlActive: string;
  settingsControlIdle: string;
  input: string;
  button: string;
  toggleOn: string;
  toggleOff: string;
};

type SettingsHistoryPanelProps = {
  widgetView: WidgetView;
  theme: WidgetTheme;
  selectedHistoryConversation: LiveChatConversation | null;
  setSelectedHistoryConversationId: (value: string) => void;
  setHistoryMessages: (value: WidgetTranscriptMessage[]) => void;
  setWidgetView: (value: WidgetView) => void;
  isHistoryTranscriptLoading: boolean;
  historyMessages: WidgetTranscriptMessage[];
  messageSizeClass: string;
  isHistoryLoading: boolean;
  historyConversations: LiveChatConversation[];
  historyError: string;
  loadHistoryTranscript: (conversationId: string) => void;
  preChatFullName: string;
  setPreChatFullName: (value: string) => void;
  preChatEmailAddress: string;
  setPreChatEmailAddress: (value: string) => void;
  preChatPhoneNumber: string;
  setPreChatPhoneNumber: (value: string) => void;
  handleSaveProfile: () => void;
  isProfileSaving: boolean;
  profileStatusMessage: string;
  textSize: TextSize;
  setTextSize: (value: TextSize) => void;
  writeStoredValue: (key: string, value: string) => void;
  widgetTextSizeKey: string;
  resolvedAccent: string;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  widgetDarkModeKey: string;
  isMessageSoundsEnabled: boolean;
  setIsMessageSoundsEnabled: (updater: (current: boolean) => boolean) => void;
  widgetMessageSoundsKey: string;
};

const SettingsHistoryPanel = ({
  widgetView,
  theme,
  selectedHistoryConversation,
  setSelectedHistoryConversationId,
  setHistoryMessages,
  setWidgetView,
  isHistoryTranscriptLoading,
  historyMessages,
  messageSizeClass,
  isHistoryLoading,
  historyConversations,
  historyError,
  loadHistoryTranscript,
  preChatFullName,
  setPreChatFullName,
  preChatEmailAddress,
  setPreChatEmailAddress,
  preChatPhoneNumber,
  setPreChatPhoneNumber,
  handleSaveProfile,
  isProfileSaving,
  profileStatusMessage,
  textSize,
  setTextSize,
  writeStoredValue,
  widgetTextSizeKey,
  resolvedAccent,
  isDarkMode,
  setIsDarkMode,
  widgetDarkModeKey,
  isMessageSoundsEnabled,
  setIsMessageSoundsEnabled,
  widgetMessageSoundsKey,
}: SettingsHistoryPanelProps) => {
  return (
    <>
      <div className={`flex-1 overflow-y-auto px-5 py-5 ${theme.body}`}>
        {widgetView === "history" ? (
          <>
            <button
              type="button"
              onClick={() => {
                if (selectedHistoryConversation) {
                  setSelectedHistoryConversationId("");
                  setHistoryMessages([]);
                  return;
                }

                setWidgetView("chat");
              }}
              className={`mb-4 inline-flex items-center gap-2 text-[11px] font-semibold transition-colors ${theme.settingsText}`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{selectedHistoryConversation ? "Back" : "Back to chat"}</span>
            </button>

            {selectedHistoryConversation ? (
              <div className={`${theme.settingsCard} flex-1 min-h-0 p-4 sm:p-5`}>
                <h3 className={`text-base font-semibold ${theme.settingsText}`}>Conversation Transcript</h3>
                {isHistoryTranscriptLoading ? (
                  <div className="h-full py-10 flex items-center justify-center">
                    <p className={theme.settingsMuted}>Loading transcript...</p>
                  </div>
                ) : historyMessages.length === 0 ? (
                  <div className="h-full py-10 flex items-center justify-center">
                    <p className={theme.settingsMuted}>No messages found in this conversation.</p>
                  </div>
                ) : (
                  <div className="mt-3 h-full space-y-2 overflow-y-auto pr-1">
                    {historyMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`rounded-xl px-3 py-2 ${message.senderType === "VISITOR" ? "border border-cyan-100 bg-cyan-50" : "border border-slate-200 bg-slate-100"}`}
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
            ) : (
              <>
                <h3 className={`mb-4 text-2xl font-semibold leading-tight ${theme.settingsText}`}>Past Conversations</h3>

                {isHistoryLoading ? (
                  <div className={`${theme.settingsCard} py-8 text-center`}>
                    <p className={theme.settingsMuted}>Loading chat history...</p>
                  </div>
                ) : historyConversations.length === 0 ? (
                  <div className={`${theme.settingsCard} py-8 text-center`}>
                    <p className={theme.settingsMuted}>No previous conversations found for this visitor.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {historyConversations.map((conversation) => {
                      const fallbackTicket = String(conversation._id || "").slice(-4) || "0000";
                      const ticketLabel = `Ticket #${fallbackTicket}`;
                      const dateLabel = formatDateOnly(conversation.closedAt || conversation.updatedAt || conversation.createdAt);
                      const previewText = getConversationPreview(conversation);

                      return (
                        <button
                          key={conversation._id}
                          type="button"
                          onClick={() => {
                            loadHistoryTranscript(String(conversation._id));
                          }}
                          className="w-full rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-base font-semibold leading-tight text-slate-700">{ticketLabel}</p>
                            <p className="text-sm leading-tight text-slate-400">{dateLabel || ""}</p>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="truncate text-sm leading-tight text-slate-500">{previewText}</p>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {historyError ? <p className="mt-3 text-xs text-red-500">{historyError}</p> : null}
              </>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setWidgetView("chat")}
              className={`mb-4 inline-flex items-center gap-2 text-[11px] font-semibold transition-colors ${theme.settingsText}`}
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
                onClick={handleSaveProfile}
                disabled={isProfileSaving}
                className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${theme.button}`}
                style={{ backgroundColor: resolvedAccent }}
              >
                {isProfileSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isProfileSaving ? "Saving..." : "Save Changes"}</span>
              </button>
              {profileStatusMessage ? <p className={`mt-2 ${theme.settingsMuted}`}>{profileStatusMessage}</p> : null}
            </div>

            <div className={`my-5 border-t ${theme.settingsDivider}`} />

            <div className={theme.settingsCard}>
              <p className={`${theme.settingsSectionTitle} mb-2`}>PREFERENCES</p>
              <div className="space-y-2">
                <div>
                  <p className={theme.settingsText}>Text Size</p>
                </div>
                <div className={`${theme.settingsControlShell} ${theme.settingsControlShellTone} w-full min-w-0`}>
                  {(["small", "default", "large"] as TextSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setTextSize(size);
                        writeStoredValue(widgetTextSizeKey, size);
                      }}
                      className={`min-w-0 whitespace-nowrap rounded-lg px-1.5 py-1.5 text-[10px] font-semibold capitalize leading-none transition-all sm:px-2 sm:text-[11px] ${textSize === size ? theme.settingsControlActive : theme.settingsControlIdle}`}
                      style={textSize === size ? { borderColor: resolvedAccent } : undefined}
                    >
                      {size}
                    </button>
                  ))}
                </div>
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
                  writeStoredValue(widgetDarkModeKey, String(next));
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
                    writeStoredValue(widgetMessageSoundsKey, String(next));
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
          </>
        )}
      </div>

      <div className={`border-t px-4 py-3.5 flex-shrink-0 ${theme.composer}`}>
        <p className={`text-center text-xs font-medium ${theme.poweredText}`}>
          Powered by <span className={`font-bold text-[0.65rem] ${theme.poweredBrand}`}>JAF Chatra</span>
        </p>
      </div>
    </>
  );
};

export default SettingsHistoryPanel;
