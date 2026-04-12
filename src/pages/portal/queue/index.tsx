import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import QueueView from "../../../sections/chat/QueueView";
import { useGetLiveChatQueue } from "../../../hooks/useLiveChat";
import { useGetAgents } from "../../../services/agentServices";
import liveChatServices from "../../../services/liveChatServices";
import useAuth from "../../../hooks/useAuth";
import { createLiveChatSocket } from "../../../services/liveChatRealtimeClient";

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

const QueuePage = () => {
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
    if (!tenant?.apiKey) {
      return;
    }

    const socket = createLiveChatSocket({
      apiKey: tenant.apiKey,
      role: user?.role,
      agentId: user?._id,
    });

    if (!socket) {
      return;
    }

    const onQueueMutation = () => {
      void mutate();
    };

    socket.on("NEW_CONVERSATION", onQueueMutation);
    socket.on("CONVERSATION_ASSIGNED", onQueueMutation);
    socket.on("CONVERSATION_TRANSFERRED", onQueueMutation);
    socket.on("CONVERSATION_ENDED", onQueueMutation);
    socket.on("QUEUE_UPDATED", onQueueMutation);

    return () => {
      socket.disconnect();
    };
  }, [mutate, tenant?.apiKey, user?._id, user?.role]);

  return (
    <QueueView
      queue={mappedQueue}
      agents={mappedAgents}
      onAssignConversation={async (visitor, agentId) => {
        const conversationId = visitor.conversationId || visitor.id;

        if (visitor.status === "Assigned") {
          await liveChatServices.transferConversation(conversationId, agentId);
        } else {
          await liveChatServices.assignConversation(conversationId, agentId);
        }

        await mutate();
      }}
      onStartChat={(visitor) => {
        localStorage.setItem("jaf_active_chat_visitor", JSON.stringify(visitor));
        window.dispatchEvent(new Event("jaf_chat_session_start"));
        navigate("/portal/chat-sessions");
      }}
    />
  );
};

export default QueuePage;
