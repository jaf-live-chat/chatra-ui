import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import QueueView from "../../../sections/chat/QueueView";
import { useGetLiveChatQueue } from "../../../hooks/useLiveChat";
import useAuth from "../../../hooks/useAuth";
import { createLiveChatSocket } from "../../../services/liveChatRealtimeClient";
import type { LiveChatAgent, LiveChatConversation, LiveChatQueueEntry, LiveChatVisitor } from "../../../models/LiveChatModel";
import type { QueueVisitorRow } from "../../../models/QueueViewModel";

const isConversationObject = (value: LiveChatQueueEntry["conversationId"]): value is LiveChatConversation =>
  typeof value === "object" && value !== null;

const isVisitorObject = (value: LiveChatQueueEntry["visitorId"]): value is LiveChatVisitor =>
  typeof value === "object" && value !== null;

const isAgentObject = (value: LiveChatQueueEntry["agentId"]): value is LiveChatAgent =>
  typeof value === "object" && value !== null;

const QueuePage = () => {
  const navigate = useNavigate();
  const { tenant, user } = useAuth();
  const { queue, mutate } = useGetLiveChatQueue({ page: 1, limit: 100 });

  const mappedQueue = useMemo<QueueVisitorRow[]>(() => {
    return (queue || []).map((entry) => {
      const conversation = isConversationObject(entry.conversationId) ? entry.conversationId : null;
      const visitor = isVisitorObject(entry.visitorId) ? entry.visitorId : null;
      const agent = isAgentObject(entry.agentId) ? entry.agentId : null;
      const conversationId = conversation?._id || String(entry.conversationId || entry._id);
      const visitorLabel = visitor?.name || (visitor?.visitorToken ? `Visitor ${String(visitor.visitorToken).slice(-4)}` : "Website Visitor");
      const locationCity = conversation?.locationCity || visitor?.locationCity || "Unknown";
      const locationCountry = conversation?.locationCountry || visitor?.locationCountry || "Unknown";
      const normalizedAgentId = agent?._id || (typeof entry.agentId === "string" ? entry.agentId : null);

      return {
        id: String(conversationId),
        conversationId: String(conversationId),
        sessionId: String(conversationId),
        visitorId: visitor?._id || null,
        name: visitorLabel,
        message: "Visitor is waiting for support.",
        status: conversation?.status === "OPEN" ? "Assigned" : "Waiting",
        queuedAt: entry.queuedAt || conversation?.queuedAt || null,
        assignedAt: entry.assignedAt || conversation?.assignedAt || null,
        agentId: normalizedAgentId,
        agentName: agent?.fullName || "",
        ipAddress: visitor?.ipAddress || conversation?.ipAddress || "",
        location: locationCity,
        country: locationCountry,
      };
    });
  }, [queue]);

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
      onStartChat={(visitor) => {
        localStorage.setItem("jaf_active_chat_visitor", JSON.stringify(visitor));
        window.dispatchEvent(new Event("jaf_chat_session_start"));
        navigate("/portal/chat-sessions");
      }}
    />
  );
};

export default QueuePage;
