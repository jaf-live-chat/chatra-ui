import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import QueueView from "../../../sections/chat/QueueView";
import { useGetLiveChatQueue } from "../../../hooks/useLiveChat";
import { useGetAgents } from "../../../services/agentServices";
import liveChatServices from "../../../services/liveChatServices";
import useAuth from "../../../hooks/useAuth";
import { API_BASE_URL } from "../../../constants/constants";

const formatQueueDuration = (queuedAt?: string | null) => {
  if (!queuedAt) {
    return "0m";
  }

  const queuedTime = new Date(queuedAt).getTime();
  if (Number.isNaN(queuedTime)) {
    return "0m";
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - queuedTime) / 1000));
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
};

const resolveSocketUrl = () => {
  const apiBaseUrl = String(API_BASE_URL).trim().replace(/\/$/, "");
  const rootUrl = apiBaseUrl.replace(/\/api\/v\d+\/?$/i, "");

  if (rootUrl.startsWith("https://")) {
    return `wss://${rootUrl.slice("https://".length)}`;
  }

  if (rootUrl.startsWith("http://")) {
    return `ws://${rootUrl.slice("http://".length)}`;
  }

  return "";
};

const AgentQueuePage = () => {
  const navigate = useNavigate();
  const { tenant, user } = useAuth();
  const { queue, mutate } = useGetLiveChatQueue({ page: 1, limit: 100 });
  const { agents } = useGetAgents({ page: 1, limit: 100 });

  const mappedQueue = useMemo(() => {
    return (queue || []).map((entry: any) => {
      const conversation = typeof entry.conversationId === "object" ? entry.conversationId : null;
      const visitor = typeof entry.visitorId === "object" ? entry.visitorId : null;
      const agent = typeof entry.agentId === "object" ? entry.agentId : null;
      const conversationId = conversation?._id || entry.conversationId || entry._id;
      const visitorLabel = visitor?.name || (visitor?.visitorToken ? `Visitor ${String(visitor.visitorToken).slice(-4)}` : "Website Visitor");
      const locationCity = conversation?.locationCity || visitor?.locationCity || "Unknown";
      const locationCountry = conversation?.locationCountry || visitor?.locationCountry || "Unknown";

      return {
        id: String(conversationId),
        conversationId: String(conversationId),
        sessionId: String(conversationId),
        visitorId: visitor?._id || null,
        name: visitorLabel,
        message: "Visitor is waiting for support.",
        status: conversation?.status === "OPEN" ? "Assigned" : "Waiting",
        timeInQueue: formatQueueDuration(entry.queuedAt || conversation?.queuedAt),
        agentId: agent?._id || entry.agentId || null,
        agentName: agent?.fullName || "",
        ipAddress: visitor?.ipAddress || conversation?.ipAddress || "",
        location: locationCity,
        country: locationCountry,
      };
    });
  }, [queue]);

  const mappedAgents = useMemo(() => {
    return (agents || []).map((agent) => ({
      id: agent._id,
      name: agent.fullName,
      status: String(agent.status || "").toUpperCase() === "AVAILABLE" ? "online" : "away",
      activeChats: String(agent.status || "").toUpperCase() === "BUSY" ? 1 : 0,
    }));
  }, [agents]);

  useEffect(() => {
    const socketUrl = resolveSocketUrl();
    if (!socketUrl || !tenant?.apiKey) {
      return;
    }

    try {
      const url = new URL(`${socketUrl.replace(/\/$/, "")}/ws/live-chat`);
      url.searchParams.set("apiKey", tenant.apiKey);
      if (user?.role) {
        url.searchParams.set("role", user.role);
      }
      if (user?._id) {
        url.searchParams.set("agentId", user._id);
      }

      const socket = new WebSocket(url.toString());
      socket.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data) as { event?: string };
          if (["NEW_CONVERSATION", "CONVERSATION_ASSIGNED", "CONVERSATION_TRANSFERRED", "CONVERSATION_ENDED"].includes(String(payload.event || ""))) {
            void mutate();
          }
        } catch {
          // Ignore malformed events.
        }
      });

      return () => {
        socket.close();
      };
    } catch {
      return;
    }
  }, [mutate, tenant?.apiKey, user?._id, user?.role]);

  return (
    <QueueView
      queue={mappedQueue}
      agents={mappedAgents}
      isAgent={true}
      currentAgentId={user?._id}
      onAcceptAssignment={async (assignment) => {
        await liveChatServices.acceptConversation(assignment.conversationId || assignment.visitorId);
        await mutate();
      }}
      onStartChat={(visitor) => {
        localStorage.setItem("jaf_active_chat_visitor", JSON.stringify(visitor));
        window.dispatchEvent(new Event("jaf_chat_session_start"));
        navigate("/portal/agent/chat-sessions");
      }}
    />
  );
};

export default AgentQueuePage;
