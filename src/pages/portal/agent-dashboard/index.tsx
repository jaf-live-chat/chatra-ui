import { useState, useMemo, useEffect } from "react";
import {
  ListOrdered,
  ArrowRight,
  Clock,
  MessagesSquare,
  History,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";

const initialMockQueue = [
  { id: "Q-1001", name: "Alice Johnson", message: "I need help with upgrading my plan.", status: "Waiting", timeInQueue: "5m 20s" },
  { id: "Q-1002", name: "Michael Smith", message: "Can I connect my own custom domain?", status: "Waiting", timeInQueue: "12m 45s" },
  { id: "Q-1003", name: "Emily Davis", message: "My payment keeps failing. Please help.", status: "Assigned", timeInQueue: "2m 10s" },
  { id: "Q-1004", name: "James Wilson", message: "How do I add more team members?", status: "Waiting", timeInQueue: "8m 05s" },
  { id: "Q-1005", name: "Sarah Brown", message: "I am having trouble logging in.", status: "Waiting", timeInQueue: "15m 30s" },
  { id: "Q-1006", name: "David Lee", message: "What are the limitations of the free tier?", status: "Assigned", timeInQueue: "1m 15s" },
  { id: "Q-1007", name: "Sophia Martinez", message: "Is there a way to export my data?", status: "Waiting", timeInQueue: "4m 50s" },
  { id: "Q-1008", name: "Daniel Taylor", message: "I want to cancel my subscription.", status: "Waiting", timeInQueue: "0m" },
  { id: "Q-1009", name: "Emma Wilson", message: "How do I setup SSO?", status: "Waiting", timeInQueue: "11m 10s" },
  { id: "Q-1010", name: "Oliver Garcia", message: "Can I get a refund for my last invoice?", status: "Waiting", timeInQueue: "6m 30s" },
  { id: "Q-1011", name: "Mia Rodriguez", message: "The dashboard is not loading properly.", status: "Assigned", timeInQueue: "3m 45s" },
  { id: "Q-1012", name: "William Martinez", message: "I need to update my billing address.", status: "Waiting", timeInQueue: "9m 20s" },
  { id: "Q-1013", name: "Ava Hernandez", message: "Where can I find my API keys?", status: "Waiting", timeInQueue: "7m 50s" },
  { id: "Q-1014", name: "Noah Lopez", message: "I forgot my password and the reset link isn't working.", status: "Waiting", timeInQueue: "14m 15s" },
];

const AGENT_QUEUE_STORAGE_KEY = "jaf_agent_mock_queue_state";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [queueItems, setQueueItems] = useState<typeof initialMockQueue>(() => {
    // Rehydrate from localStorage so state survives navigation away from this route
    try {
      const stored = localStorage.getItem(AGENT_QUEUE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { /* silently fail */ }
    return initialMockQueue;
  });
  const [liveQueueItems, setLiveQueueItems] = useState<any[]>([]);

  // Persist queueItems to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(AGENT_QUEUE_STORAGE_KEY, JSON.stringify(queueItems));
    } catch (e) { /* silently fail */ }
  }, [queueItems]);

  // Load live visitor chats from shared localStorage queue
  useEffect(() => {
    const loadLiveQueue = () => {
      try {
        const stored = localStorage.getItem("jaf_live_queue");
        if (stored) {
          const parsed = JSON.parse(stored);
          setLiveQueueItems(parsed);
        } else {
          setLiveQueueItems([]);
        }
      } catch (e) {
        // silently fail
      }
    };

    loadLiveQueue();

    const handleQueueUpdate = () => loadLiveQueue();
    window.addEventListener("jaf_queue_updated", handleQueueUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "jaf_live_queue") loadLiveQueue();
    };
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(loadLiveQueue, 2000);

    return () => {
      window.removeEventListener("jaf_queue_updated", handleQueueUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Merge mock queue + live visitor queue
  const mergedQueue = useMemo(() => {
    const liveIds = liveQueueItems.map((l: any) => l.id);
    const mockFiltered = queueItems.filter((q) => !liveIds.includes(q.id));
    return [...liveQueueItems, ...mockFiltered];
  }, [queueItems, liveQueueItems]);

  // Exclude accepted assignments from waiting count
  const acceptedIds = useMemo(() => {
    try {
      const stored = localStorage.getItem("jaf_agent_assignments");
      if (stored) {
        const assignments = JSON.parse(stored);
        return new Set(assignments.filter((a: any) => a.status === "accepted").map((a: any) => a.visitorId));
      }
    } catch (e) { /* silently fail */ }
    return new Set();
  }, [queueItems, liveQueueItems]); // re-evaluate when queue changes

  const waitingCount = mergedQueue.filter((q) => q.status === "Waiting" && !acceptedIds.has(q.id)).length;
  const assignedCount = mergedQueue.filter((q) => q.status === "Assigned").length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Welcome back, Agent</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Pick up waiting visitors or manage your active chats.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Waiting in Queue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{waitingCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <MessagesSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Currently Assigned</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{assignedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm divide-y divide-gray-100 dark:divide-slate-700">
        {[
          {
            label: "View live queue",
            sub: "See and pick up waiting visitors",
            path: "/portal/agent/queue",
            icon: <ListOrdered className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
          {
            label: "Chat sessions",
            sub: "Manage your active conversations",
            path: "/portal/agent/chat-sessions",
            icon: <MessagesSquare className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
          {
            label: "Chat history",
            sub: "Review past conversations",
            path: "/portal/agent/history",
            icon: <History className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
          {
            label: "Quick Replies",
            sub: "Manage your saved response shortcuts",
            path: "/portal/agent/quick-replies",
            icon: <Zap className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 group-hover:border-cyan-100 dark:group-hover:border-cyan-800 transition-colors shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{item.sub}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default AgentDashboard;




