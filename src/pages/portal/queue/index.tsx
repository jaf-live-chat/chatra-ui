import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import QueueView from "../../../sections/chat/QueueView";
import { useGetActiveLiveChat, useGetLiveChatQueue } from "../../../hooks/useLiveChat";
import { useGetAgents } from "../../../services/agentServices";
import useAuth from "../../../hooks/useAuth";
import { createLiveChatSocket } from "../../../services/liveChatRealtimeClient";
import liveChatServices from "../../../services/liveChatServices";
import type { LiveChatAgent, LiveChatConversation, LiveChatQueueEntry, LiveChatVisitor } from "../../../models/LiveChatModel";
import type { QueueAgentOption, QueueVisitorRow } from "../../../models/QueueViewModel";

const isConversationObject = (value: LiveChatQueueEntry["conversationId"]): value is LiveChatConversation =>
  typeof value === "object" && value !== null;

const isVisitorObject = (value: LiveChatQueueEntry["visitorId"]): value is LiveChatVisitor =>
  typeof value === "object" && value !== null;

const isAgentObject = (value: LiveChatQueueEntry["agentId"]): value is LiveChatAgent =>
  typeof value === "object" && value !== null;

const isEndedQueueEntry = (entry: LiveChatQueueEntry) => {
  const conversation = isConversationObject(entry.conversationId) ? entry.conversationId : null;
  return Boolean(entry.endedAt) || String(conversation?.status || "").toUpperCase() === "ENDED";
};

const QueuePage = () => {
  const navigate = useNavigate();
  const { tenant, user } = useAuth();
  const { queue: waitingQueue, mutate: mutateWaitingQueue } = useGetLiveChatQueue({ page: 1, limit: 100 });
  const { queue: activeQueue, mutate: mutateActiveQueue } = useGetActiveLiveChat({ page: 1, limit: 100 });
  const { agents } = useGetAgents({ page: 1, limit: 100 });

  const combinedQueue = useMemo<LiveChatQueueEntry[]>(() => {
    const source = [...(activeQueue || []), ...(waitingQueue || [])].filter((entry) => !isEndedQueueEntry(entry));
    const seenConversationIds = new Set<string>();

    return source.filter((entry) => {
      const conversationValue = entry.conversationId;
      const conversationId = typeof conversationValue === "object" && conversationValue
        ? String(conversationValue._id || "")
        : String(conversationValue || entry._id || "");

      if (!conversationId || seenConversationIds.has(conversationId)) {
        return false;
      }

      seenConversationIds.add(conversationId);
      return true;
    });
  }, [activeQueue, waitingQueue]);

  const refreshQueue = useCallback(() => {
    void mutateWaitingQueue();
    void mutateActiveQueue();
  }, [mutateActiveQueue, mutateWaitingQueue]);

  const mappedQueue = useMemo<QueueVisitorRow[]>(() => {
    return (combinedQueue || []).map((entry) => {
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
  }, [combinedQueue]);

  const mappedAgents = useMemo<QueueAgentOption[]>(() => {
    return (agents || []).map((agent) => ({
      id: agent._id,
      name: agent.fullName,
      status: ["AVAILABLE", "BUSY", "OFFLINE", "AWAY"].includes(String(agent.status || "").toUpperCase())
        ? (String(agent.status).toUpperCase() as QueueAgentOption["status"])
        : "AWAY",
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

    const queueEvents = [
      "NEW_CONVERSATION",
      "CONVERSATION_ASSIGNED",
      "CONVERSATION_TRANSFERRED",
      "CONVERSATION_ENDED",
      "QUEUE_UPDATED",
      "connect",
      "reconnect",
    ] as const;

    queueEvents.forEach((eventName) => socket.on(eventName, refreshQueue));

    return () => {
      queueEvents.forEach((eventName) => socket.off(eventName, refreshQueue));
      socket.disconnect();
    };
  }, [refreshQueue, tenant?.apiKey, user?._id, user?.role]);

  return (
    <QueueView
      queue={mappedQueue}
      actorRole={user?.role}
      actorStatus={user?.status}
      selfPickEligible={Boolean(user?.selfPickEligible)}
      agents={mappedAgents}
      onAssignConversation={async (visitor, agentId) => {
        await liveChatServices.assignConversation(visitor.conversationId || visitor.id, agentId);
        await Promise.all([mutateWaitingQueue(), mutateActiveQueue()]);
      }}
      onTakeConversation={async (visitor) => {
        await liveChatServices.acceptConversation(visitor.conversationId || visitor.id);
        await Promise.all([mutateWaitingQueue(), mutateActiveQueue()]);
        navigate("/portal/chat-sessions");
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
