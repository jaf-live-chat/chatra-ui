import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import QueueView from "../../../sections/chat/QueueView";
import { useGetActiveLiveChat, useGetLiveChatQueue } from "../../../hooks/useLiveChat";
import useAuth from "../../../hooks/useAuth";
import { useStaffLiveChat } from "../../../hooks/useStaffLiveChat";
import liveChatServices from "../../../services/liveChatServices";
import type { LiveChatAgent, LiveChatConversation, LiveChatQueueEntry, LiveChatVisitor } from "../../../models/LiveChatModel";
import type { QueueVisitorRow } from "../../../models/QueueViewModel";

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

const AgentQueuePage = () => {
  const navigate = useNavigate();
  const { tenant, user } = useAuth();
  const { queue: waitingQueue, mutate: mutateWaitingQueue } = useGetLiveChatQueue({ page: 1, limit: 100 });
  const { queue: activeQueue, mutate: mutateActiveQueue } = useGetActiveLiveChat({ page: 1, limit: 100 });

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
      const locationCity = conversation?.locationCity || visitor?.locationCity || "";
      const locationCountry = conversation?.locationCountry || visitor?.locationCountry || "";
      const normalizedAgentId = agent?._id || (typeof entry.agentId === "string" ? entry.agentId : null);
      const agentName = agent?.fullName || "";
      const agentDisplayName = agent?.displayName || (agentName && normalizedAgentId ? `${agentName} (${normalizedAgentId})` : agentName);

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
        agentName,
        agentDisplayName,
        ipAddress: visitor?.ipAddress || conversation?.ipAddress || "",
        location: locationCity,
        country: locationCountry,
      };
    });
  }, [combinedQueue]);

  // Use shared staff realtime hook for queue updates
  useStaffLiveChat(
    tenant?.apiKey ?? undefined,
    tenant?.databaseName ?? undefined,
    tenant?.id ?? undefined,
    user?.role ?? undefined,
    user?._id ?? undefined,
    {
      onConversationAssigned: refreshQueue,
      onConversationTransferred: refreshQueue,
      onQueueUpdated: refreshQueue,
      onConversationEnded: refreshQueue,
    },
  );

  return (
    <QueueView
      queue={mappedQueue}
      actorRole={user?.role}
      actorStatus={user?.status}
      isAgent={true}
      currentAgentId={user?._id}
      onSelfPickConversation={async (visitor) => {
        await liveChatServices.acceptConversation(visitor.conversationId || visitor.id);
        await Promise.all([mutateWaitingQueue(), mutateActiveQueue()]);
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
