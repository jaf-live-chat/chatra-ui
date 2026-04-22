import { useCallback, useMemo, useState } from "react";
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

interface QueueRealtimeMessagePatch {
  latestVisitorMessage: string;
  totalVisitorMessageCount: number;
}

const AgentQueuePage = () => {
  const navigate = useNavigate();
  const { tenant, user } = useAuth();
  const { queue: waitingQueue, mutate: mutateWaitingQueue } = useGetLiveChatQueue({ page: 1, limit: 100 });
  const { queue: activeQueue, mutate: mutateActiveQueue } = useGetActiveLiveChat({ page: 1, limit: 100 });
  const [realtimePatches, setRealtimePatches] = useState<Record<string, QueueRealtimeMessagePatch>>({});

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

  const queueMessageBaseline = useMemo(() => {
    const baseline = new Map<string, QueueRealtimeMessagePatch & { status: string }>();

    (combinedQueue || []).forEach((entry) => {
      const conversation = isConversationObject(entry.conversationId) ? entry.conversationId : null;
      const conversationId = String(conversation?._id || entry.conversationId || entry._id || "").trim();

      if (!conversationId) {
        return;
      }

      baseline.set(conversationId, {
        latestVisitorMessage: String((entry as { latestVisitorMessage?: string }).latestVisitorMessage || "").trim(),
        totalVisitorMessageCount: Math.max(0, Number((entry as { totalVisitorMessageCount?: number }).totalVisitorMessageCount || 0)),
        status: String(entry.status || "").toUpperCase(),
      });
    });

    return baseline;
  }, [combinedQueue]);

  const handleQueueRefresh = useCallback(() => {
    setRealtimePatches({});
    refreshQueue();
  }, [refreshQueue]);

  const handleQueueMessageUpdated = useCallback((payload: { conversationId?: string; latestVisitorMessage?: string; incrementBy?: number }) => {
    const conversationId = String(payload?.conversationId || "").trim();

    if (!conversationId) {
      return;
    }

    const baseline = queueMessageBaseline.get(conversationId);

    if (!baseline || baseline.status !== "WAITING") {
      return;
    }

    const incrementBy = Math.max(1, Number(payload?.incrementBy || 1));
    const latestVisitorMessage = String(payload?.latestVisitorMessage || "").trim() || baseline.latestVisitorMessage || "Visitor is waiting for support.";

    setRealtimePatches((current) => {
      const existing = current[conversationId];
      const nextCount = Math.max(
        Number(existing?.totalVisitorMessageCount || 0),
        Number(baseline.totalVisitorMessageCount || 0),
      ) + incrementBy;

      return {
        ...current,
        [conversationId]: {
          latestVisitorMessage,
          totalVisitorMessageCount: nextCount,
        },
      };
    });
  }, [queueMessageBaseline]);

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
      const latestVisitorMessage = String((entry as { latestVisitorMessage?: string }).latestVisitorMessage || "").trim();
      const totalVisitorMessageCount = Math.max(0, Number((entry as { totalVisitorMessageCount?: number }).totalVisitorMessageCount || 0));
      const realtimePatch = realtimePatches[String(conversationId)];
      const effectiveLatestVisitorMessage = String(realtimePatch?.latestVisitorMessage || latestVisitorMessage).trim();
      const effectiveTotalVisitorMessageCount = Math.max(
        totalVisitorMessageCount,
        Number(realtimePatch?.totalVisitorMessageCount || 0),
      );

      return {
        id: String(conversationId),
        conversationId: String(conversationId),
        sessionId: String(conversationId),
        visitorId: visitor?._id || null,
        name: visitorLabel,
        message: effectiveLatestVisitorMessage || "Visitor is waiting for support.",
        latestVisitorMessage: effectiveLatestVisitorMessage,
        totalVisitorMessageCount: effectiveTotalVisitorMessageCount,
        unreadVisitorMessageCount: Number((entry as { unreadVisitorMessageCount?: number }).unreadVisitorMessageCount || 0),
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
  }, [combinedQueue, realtimePatches]);

  // Use shared staff realtime hook for queue updates
  useStaffLiveChat(
    tenant?.apiKey ?? undefined,
    tenant?.databaseName ?? undefined,
    tenant?.id ?? undefined,
    user?.role ?? undefined,
    user?._id ?? undefined,
    {
      onConnect: handleQueueRefresh,
      onReconnect: handleQueueRefresh,
      onConversationAssigned: handleQueueRefresh,
      onConversationTransferred: handleQueueRefresh,
      onQueueUpdated: handleQueueRefresh,
      onConversationEnded: handleQueueRefresh,
      onQueueMessageUpdated: handleQueueMessageUpdated,
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
      onOpenConversation={(visitor) => {
        navigate(`/portal/agent/chat-sessions?conversationId=${encodeURIComponent(visitor.conversationId || visitor.id)}`);
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
