import { useEffect, useState } from "react";
import { Clock, Eye, History, MessagesSquare, Search, Star, X } from "lucide-react";

const renderRatingStars = (rating?: number | null) => {
  const resolvedRating = Number.isFinite(Number(rating)) ? Math.max(0, Math.min(5, Number(rating))) : 0;

  if (resolvedRating <= 0) {
    return <span className="text-xs text-gray-400 dark:text-slate-500">No rating</span>;
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`w-3.5 h-3.5 ${index < Math.round(resolvedRating) ? "fill-current" : "text-gray-300 dark:text-slate-600"}`} />
      ))}
      <span className="ml-1 text-xs font-medium text-gray-600 dark:text-slate-400">{resolvedRating.toFixed(1)}/5</span>
    </span>
  );
};

import { useDarkMode } from "../../providers/DarkModeContext";
import { HistoryEntry, TranscriptMessage } from "../../models/ChatSessionManagementModel";
import { type LiveChatMessage } from "../../models/LiveChatModel";
import liveChatServices from "../../services/liveChatServices";
import { calculateAverageDuration } from "../../utils/chatDurationCalculator";
import getInitials from "../../utils/getInitials";

export type ChatHistoryTranscriptMap = Record<string, TranscriptMessage[]>;

interface ChatHistorySectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  endedChats: HistoryEntry[];
  endedTranscripts: ChatHistoryTranscriptMap;
  mutateHistory?: () => void;
}

const avatarColors = ["#0891b2", "#7c3aed", "#059669", "#d97706", "#dc2626", "#2563eb"];

function getAvatarColor(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return avatarColors[code % avatarColors.length];
}

const ChatHistorySection = ({ searchQuery, setSearchQuery, endedChats, endedTranscripts, mutateHistory }: ChatHistorySectionProps) => {
  const [transcriptChatId, setTranscriptChatId] = useState<string | null>(null);
  const [transcriptCache, setTranscriptCache] = useState<ChatHistoryTranscriptMap>(endedTranscripts);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const { isDark } = useDarkMode();

  const allHistory: HistoryEntry[] = [...endedChats];

  const transcriptChat = transcriptChatId ? allHistory.find((c) => c.id === transcriptChatId) : null;
  const transcriptMessages = transcriptChatId ? transcriptCache[transcriptChatId] ?? [] : [];

  useEffect(() => {
    if (!transcriptChatId || transcriptCache[transcriptChatId]) {
      return;
    }

    setIsTranscriptLoading(true);

    void liveChatServices
      .getConversationMessages(transcriptChatId, { page: 1, limit: 100 })
      .then((response: any) => {
        const mappedTranscript: TranscriptMessage[] = (response.messages || []).map((message: LiveChatMessage, index: number) => ({
          sender: message.senderType === "VISITOR" ? ("visitor" as const) : ("agent" as const),
          text: String(message.message || ""),
          time: message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : `${index + 1}`,
        }));

        setTranscriptCache((previousCache) => ({
          ...previousCache,
          [transcriptChatId]: mappedTranscript,
        }));
      })
      .finally(() => {
        setIsTranscriptLoading(false);
      });
  }, [transcriptCache, transcriptChatId]);

  const filtered = allHistory.filter((chat) => {
    return (
      chat.visitor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate average duration from all history or filtered?
  // Using filtered to update dynamically as you search
  const averageDuration = calculateAverageDuration(filtered.length > 0 ? filtered : allHistory);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Chat History</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Browse and review past chat conversations and their outcomes.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Chats</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{allHistory.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Resolved</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{allHistory.filter((c) => c.status === "Resolved").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Avg Duration</p>
          <p className="text-2xl font-semibold text-cyan-600 dark:text-cyan-400">{averageDuration}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          {/* Header row */}
          <div className="min-w-[980px] grid grid-cols-[150px_1fr_140px_150px_130px_150px_130px] border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">ID</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Visitor</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Agent</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date &amp; Time</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Duration</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Rating</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center">Action</div>
          </div>
          {/* Data rows */}
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {filtered.map((chat) => (
              <div
                key={chat.id}
                className="min-w-[980px] grid grid-cols-[150px_1fr_140px_150px_130px_150px_130px] hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
              >
                {/* ID */}
                <div className="px-5 py-3.5 flex items-center">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-[#0891b2] dark:text-cyan-400 bg-[#ecfeff] dark:bg-cyan-900/20 px-2 py-0.5 rounded font-semibold tracking-wide">
                      {
                        chat.queueDisplayId ?? (() => {
                          const num = parseInt(chat.id.replace(/[^\d]/g, ""), 10) || 0;
                          const hash = ((num * 7919 + 1234) % 9000) + 1000;
                          return `Q-${hash}`;
                        })()
                      }
                    </span>
                    {chat.isLive && (
                      <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
                {/* Visitor */}
                <div className="px-5 py-3.5 flex items-center">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                      style={{ backgroundColor: getAvatarColor(chat.visitor) }}
                    >
                      {getInitials(chat.visitorFullName, "V")}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{chat.visitor}</span>
                  </div>
                </div>
                {/* Agent */}
                <div className="px-5 py-3.5 flex items-center text-sm text-gray-600 dark:text-slate-400">{chat.agent}</div>
                {/* Date & Time */}
                <div className="px-5 py-3.5 flex items-center">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{chat.date}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{chat.time}</p>
                  </div>
                </div>
                {/* Duration */}
                <div className="px-5 py-3.5 flex items-center">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                    <span className="text-sm text-gray-600 dark:text-slate-400">{chat.duration}</span>
                  </div>
                </div>
                <div className="px-5 py-3.5 flex items-center">{renderRatingStars(chat.rating)}</div>
                {/* Action */}
                <div className="px-5 py-3.5 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTranscriptChatId(chat.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Transcript
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">No matching chat history found.</p>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {filtered.map((chat) => (
          <div key={chat.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ backgroundColor: getAvatarColor(chat.visitor) }}
                >
                  {getInitials(chat.visitorFullName, "V")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{chat.visitor}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{chat.agent}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#0891b2] dark:text-cyan-400 bg-[#ecfeff] dark:bg-cyan-900/20 px-2 py-0.5 rounded font-semibold tracking-wide shrink-0">
                {
                  chat.queueDisplayId ?? (() => {
                    const num = parseInt(chat.id.replace(/[^\d]/g, ""), 10) || 0;
                    const hash = ((num * 7919 + 1234) % 9000) + 1000;
                    return `Q-${hash}`;
                  })()
                }
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>
                {chat.date} {chat.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {chat.duration}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">{renderRatingStars(chat.rating)}</span>
            </div>
            <button
              onClick={() => setTranscriptChatId(chat.id)}
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View Transcript
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <History className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">No matching chat history found.</p>
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      {transcriptChat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60"
          onClick={() => setTranscriptChatId(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 w-full max-w-lg mx-4 overflow-hidden max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: getAvatarColor(transcriptChat.visitor) }}
                >
                  {getInitials(transcriptChat.visitorFullName, "V")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{transcriptChat.visitor}</p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">
                    {transcriptChat.id} &middot; {transcriptChat.date} at {transcriptChat.time} &middot; {transcriptChat.duration}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTranscriptChatId(null)}
                className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transcript Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50 dark:bg-slate-900/30" style={{ scrollbarWidth: "thin" }}>
              {isTranscriptLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 dark:text-slate-500">Loading transcript...</p>
                </div>
              ) : transcriptMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessagesSquare className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-slate-500">No transcript available.</p>
                </div>
              ) : (
                transcriptMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex ${msg.sender === "agent" ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[75%]`}>
                      {msg.sender === "visitor" ? (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                          style={{ backgroundColor: getAvatarColor(transcriptChat.visitor) }}
                        >
                          {getInitials(transcriptChat.visitorFullName, "V")}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-800 dark:bg-slate-600 flex items-center justify-center text-white text-[9px] font-semibold shrink-0">
                          {getInitials(transcriptChat.agentFullName || transcriptChat.agent, "A")}
                        </div>
                      )}
                      <div className={`flex flex-col ${msg.sender === "agent" ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 mb-0.5 px-1">
                          {msg.sender === "visitor" ? transcriptChat.visitor : transcriptChat.agent} &middot; {msg.time}
                        </span>
                        <div
                          className={`px-3 py-2 text-sm shadow-sm ${msg.sender === "visitor"
                            ? "bg-[#e5e7eb] dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-2xl rounded-bl-[4px]"
                            : "bg-cyan-600 text-white rounded-2xl rounded-br-[4px]"
                            }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 shrink-0 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 dark:text-slate-500">
                {transcriptMessages.length} message{transcriptMessages.length !== 1 ? "s" : ""} &middot; Agent: {transcriptChat.agent}
              </span>
              <button
                onClick={() => setTranscriptChatId(null)}
                className="px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistorySection;
