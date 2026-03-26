import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import QueueView from "../../../sections/chat/QueueView";

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

const QUEUE_STORAGE_KEY = "jaf_mock_queue_state";

const QueuePage = () => {
  const navigate = useNavigate();
  const [queueItems, setQueueItems] = useState<typeof initialMockQueue>(() => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // silently fail
    }
    return initialMockQueue;
  });
  const [liveQueueItems, setLiveQueueItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queueItems));
    } catch (e) {
      // silently fail
    }
  }, [queueItems]);

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

  const mergedQueue = useMemo(() => {
    const liveIds = liveQueueItems.map((l: any) => l.id);
    const mockFiltered = queueItems.filter((q) => !liveIds.includes(q.id));
    return [...liveQueueItems, ...mockFiltered];
  }, [queueItems, liveQueueItems]);

  return (
    <QueueView
      queue={mergedQueue}
      onStartChat={(visitor) => {
        setQueueItems((prev) =>
          prev.map((q) => (q.id === visitor.id ? { ...q, status: "Assigned" } : q))
        );

        if (visitor.sessionId) {
          try {
            const stored = localStorage.getItem("jaf_live_queue");
            if (stored) {
              const liveQueue = JSON.parse(stored);
              const updated = liveQueue.map((q: any) =>
                q.id === visitor.id ? { ...q, status: "Assigned" } : q
              );
              localStorage.setItem("jaf_live_queue", JSON.stringify(updated));
              window.dispatchEvent(new Event("jaf_queue_updated"));
            }
          } catch (e) {
            // silently fail
          }
        }

        localStorage.setItem("jaf_active_chat_visitor", JSON.stringify(visitor));
        window.dispatchEvent(new Event("jaf_chat_session_start"));
        navigate("/portal/chat-sessions");
      }}
    />
  );
};

export default QueuePage;
