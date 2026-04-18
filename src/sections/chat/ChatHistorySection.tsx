import { useEffect, useMemo, useState } from "react";
import { Clock, Eye, History, Search, Star } from "lucide-react";
import Avatar from "@mui/material/Avatar";
import ReusableTable, { type ReusableTableColumn } from "../../components/ReusableTable";
import ChatTranscript from "../../components/ChatTranscript";
import { HistoryEntry, TranscriptMessage } from "../../models/ChatSessionManagementModel";
import { type LiveChatMessage } from "../../models/LiveChatModel";
import { useDarkMode } from "../../providers/DarkModeContext";
import liveChatServices from "../../services/liveChatServices";
import { calculateAverageDuration } from "../../utils/chatDurationCalculator";
import getInitials from "../../utils/getInitials";

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

function getQueueDisplayId(chat: HistoryEntry) {
  if (chat.queueDisplayId) {
    return chat.queueDisplayId;
  }

  const num = parseInt(chat.id.replace(/[^\d]/g, ""), 10) || 0;
  const hash = ((num * 7919 + 1234) % 9000) + 1000;
  return `Q-${hash}`;
}

const ChatHistorySection = ({ searchQuery, setSearchQuery, endedChats, endedTranscripts, mutateHistory }: ChatHistorySectionProps) => {
  const [transcriptChatId, setTranscriptChatId] = useState<string | null>(null);
  const [transcriptCache, setTranscriptCache] = useState<ChatHistoryTranscriptMap>(endedTranscripts);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const { isDark } = useDarkMode();

  const allHistory: HistoryEntry[] = [...endedChats];

  const transcriptChat = transcriptChatId ? allHistory.find((c) => c.id === transcriptChatId) : null;
  const transcriptMessages = transcriptChatId ? transcriptCache[transcriptChatId] ?? [] : [];
  const transcriptDisplayMessages = useMemo(
    () => transcriptMessages.map((message, index) => ({
      id: `${transcriptChatId || "transcript"}-${index}`,
      sender: message.sender,
      text: message.text,
      timestamp: message.time,
    })),
    [transcriptChatId, transcriptMessages],
  );

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

  const historyColumns = useMemo<ReusableTableColumn<HistoryEntry>[]>(
    () => [
      {
        id: "visitor",
        label: "Visitor",
        sortable: true,
        sortAccessor: (chat) => chat.visitor,
        renderCell: (chat) => (
          <div className="flex items-center gap-2.5">
            <Avatar
              src={chat.visitorAvatarUrl || undefined}
              alt={chat.visitor}
              className="w-7 h-7 text-xs font-semibold shrink-0"
              sx={{ bgcolor: getAvatarColor(chat.visitor) }}
            >
              {getInitials(chat.visitorFullName, "V")}
            </Avatar>
            <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{chat.visitor}</span>
          </div>
        ),
      },
      {
        id: "datetime",
        label: "Date & Time",
        sortable: true,
        sortAccessor: (chat) => `${chat.date} ${chat.time}`,
        sx: { whiteSpace: "normal" },
        renderCell: (chat) => (
          <div>
            <p className="text-sm text-gray-700 dark:text-slate-300">{chat.date}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">{chat.time}</p>
          </div>
        ),
      },
      {
        id: "duration",
        label: "Duration",
        sortable: true,
        sortAccessor: (chat) => chat.duration,
        renderCell: (chat) => (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-600 dark:text-slate-400">{chat.duration}</span>
          </div>
        ),
      },
      {
        id: "rating",
        label: "Rating",
        sortable: true,
        sortAccessor: (chat) => Number(chat.rating ?? 0),
        renderCell: (chat) => renderRatingStars(chat.rating),
      },
      {
        id: "action",
        label: "Action",
        align: "center",
        headerAlign: "center",
        renderCell: (chat) => (
          <button
            onClick={() => setTranscriptChatId(chat.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors cursor-pointer"
          >
            View Transcript
          </button>
        ),
      },
    ],
    [],
  );

  // Calculate average duration from all history or filtered?
  // Using filtered to update dynamically as you search
  const averageDuration = calculateAverageDuration(filtered.length > 0 ? filtered : allHistory);

  return (
    <div className={isDark ? "dark" : ""}>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
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

      {/* History Table */}
      <div className="hidden md:block">
        <ReusableTable
          title="History Records"
          subtitle="Visitor, timeline, duration, rating, and transcript access"
          rows={filtered}
          columns={historyColumns}
          getRowKey={(chat) => chat.id}
          tableMinWidth={980}
          tableLayout="fixed"
          search={{ show: false }}
          pagination={{ show: false }}
          emptyStateTitle="No matching chat history found"
          emptyStateDescription="Try adjusting your search query."
          totalLabel="chats"
          headerIcon={<History className="w-4 h-4" />}
        />
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {filtered.map((chat) => (
          <div key={chat.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  src={chat.visitorAvatarUrl || undefined}
                  alt={chat.visitor}
                  className="w-8 h-8 text-xs font-semibold shrink-0"
                  sx={{ bgcolor: getAvatarColor(chat.visitor) }}
                >
                  {getInitials(chat.visitorFullName, "V")}
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{chat.visitor}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{chat.agent}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#0891b2] dark:text-cyan-400 bg-[#ecfeff] dark:bg-cyan-900/20 px-2 py-0.5 rounded font-semibold tracking-wide shrink-0">
                {getQueueDisplayId(chat)}
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
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 w-full max-w-3xl mx-4 overflow-hidden h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatTranscript
              chatId={transcriptChat.visitor}
              status="ENDED"
              visitorName={transcriptChat.visitor}
              agentName={transcriptChat.agent}
              messages={transcriptDisplayMessages}
              startDate={transcriptChat.date}
              visitorAvatar={getInitials(transcriptChat.visitorFullName, "V")}
              agentAvatar={getInitials(transcriptChat.agentFullName || transcriptChat.agent, "A")}
              showTypingIndicator={false}
              onClose={() => setTranscriptChatId(null)}
            />
            {isTranscriptLoading ? (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm text-gray-600 dark:text-slate-300">
                  Loading transcript...
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistorySection;
