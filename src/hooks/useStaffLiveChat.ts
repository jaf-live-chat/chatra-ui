import { useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { createLiveChatSocket } from "../services/liveChatRealtimeClient";
import type { LiveChatMessage, LiveChatConversationEndedEvent } from "../models/LiveChatModel";

interface StaffLiveChatHandlers {
  onNewMessage?: (message: LiveChatMessage) => void;
  onMessageStatusUpdated?: (payload: { conversationId?: string; messageIds?: string[]; status?: "DELIVERED" | "SEEN"; seenByRole?: string | null }) => void;
  onConversationAssigned?: () => void;
  onConversationTransferred?: () => void;
  onConversationEnded?: (payload: LiveChatConversationEndedEvent) => void;
  onQueueUpdated?: () => void;
  onConnect?: () => void;
  onReconnect?: () => void;
}

let sharedStaffSocket: Socket | null = null;
let socketRefCount = 0;

/**
 * Hook for staff portal to subscribe to live chat events.
 * Uses a shared singleton socket to prevent duplicate connections.
 */
export const useStaffLiveChat = (
  apiKey?: string,
  databaseName?: string,
  tenantId?: string,
  role?: string,
  agentId?: string,
  handlers?: StaffLiveChatHandlers,
) => {
  const handlersRef = useRef<StaffLiveChatHandlers>(handlers || {});
  const isConnectedRef = useRef(false);

  // Keep handlers in sync
  useEffect(() => {
    handlersRef.current = handlers || {};
  }, [handlers]);

  // Initialize and manage shared socket
  useEffect(() => {
    // Only create socket if we have the necessary auth info
    if (!apiKey && !tenantId) {
      return;
    }

    // If socket already exists and is from same tenant, reuse it
    if (sharedStaffSocket && socketRefCount > 0) {
      socketRefCount += 1;
      isConnectedRef.current = sharedStaffSocket.connected;

      // Register listeners for this component
      const onNewMessage = (message: LiveChatMessage) => {
        handlersRef.current.onNewMessage?.(message);
      };

      const onMessageStatusUpdated = (payload: any) => {
        handlersRef.current.onMessageStatusUpdated?.(payload);
      };

      const onConversationAssigned = () => {
        handlersRef.current.onConversationAssigned?.();
      };

      const onConversationTransferred = () => {
        handlersRef.current.onConversationTransferred?.();
      };

      const onConversationEnded = (payload: LiveChatConversationEndedEvent) => {
        handlersRef.current.onConversationEnded?.(payload);
      };

      const onQueueUpdated = () => {
        handlersRef.current.onQueueUpdated?.();
      };

      const onConnect = () => {
        isConnectedRef.current = true;
        handlersRef.current.onConnect?.();
      };

      const onReconnect = () => {
        isConnectedRef.current = true;
        handlersRef.current.onReconnect?.();
      };

      sharedStaffSocket.on("NEW_MESSAGE", onNewMessage);
      sharedStaffSocket.on("MESSAGE_STATUS_UPDATED", onMessageStatusUpdated);
      sharedStaffSocket.on("CONVERSATION_ASSIGNED", onConversationAssigned);
      sharedStaffSocket.on("CONVERSATION_TRANSFERRED", onConversationTransferred);
      sharedStaffSocket.on("CONVERSATION_ENDED", onConversationEnded);
      sharedStaffSocket.on("QUEUE_UPDATED", onQueueUpdated);
      sharedStaffSocket.on("connect", onConnect);
      sharedStaffSocket.on("reconnect", onReconnect);

      return () => {
        socketRefCount -= 1;

        sharedStaffSocket?.off("NEW_MESSAGE", onNewMessage);
        sharedStaffSocket?.off("MESSAGE_STATUS_UPDATED", onMessageStatusUpdated);
        sharedStaffSocket?.off("CONVERSATION_ASSIGNED", onConversationAssigned);
        sharedStaffSocket?.off("CONVERSATION_TRANSFERRED", onConversationTransferred);
        sharedStaffSocket?.off("CONVERSATION_ENDED", onConversationEnded);
        sharedStaffSocket?.off("QUEUE_UPDATED", onQueueUpdated);
        sharedStaffSocket?.off("connect", onConnect);
        sharedStaffSocket?.off("reconnect", onReconnect);

        // Disconnect shared socket if no more subscribers
        if (socketRefCount === 0 && sharedStaffSocket) {
          sharedStaffSocket.disconnect();
          sharedStaffSocket = null;
        }
      };
    }

    // Create new shared socket
    socketRefCount = 1;
    const socket = createLiveChatSocket({
      apiKey,
      databaseName,
      tenantId,
      role,
      agentId,
    });

    if (!socket) {
      return;
    }

    sharedStaffSocket = socket;

    const onNewMessage = (message: LiveChatMessage) => {
      handlersRef.current.onNewMessage?.(message);
    };

    const onMessageStatusUpdated = (payload: any) => {
      handlersRef.current.onMessageStatusUpdated?.(payload);
    };

    const onConversationAssigned = () => {
      handlersRef.current.onConversationAssigned?.();
    };

    const onConversationTransferred = () => {
      handlersRef.current.onConversationTransferred?.();
    };

    const onConversationEnded = (payload: LiveChatConversationEndedEvent) => {
      handlersRef.current.onConversationEnded?.(payload);
    };

    const onQueueUpdated = () => {
      handlersRef.current.onQueueUpdated?.();
    };

    const onConnect = () => {
      isConnectedRef.current = true;
      handlersRef.current.onConnect?.();
    };

    const onReconnect = () => {
      isConnectedRef.current = true;
      handlersRef.current.onReconnect?.();
    };

    socket.on("NEW_MESSAGE", onNewMessage);
    socket.on("MESSAGE_STATUS_UPDATED", onMessageStatusUpdated);
    socket.on("CONVERSATION_ASSIGNED", onConversationAssigned);
    socket.on("CONVERSATION_TRANSFERRED", onConversationTransferred);
    socket.on("CONVERSATION_ENDED", onConversationEnded);
    socket.on("QUEUE_UPDATED", onQueueUpdated);
    socket.on("connect", onConnect);
    socket.on("reconnect", onReconnect);

    return () => {
      socketRefCount -= 1;

      socket.off("NEW_MESSAGE", onNewMessage);
      socket.off("MESSAGE_STATUS_UPDATED", onMessageStatusUpdated);
      socket.off("CONVERSATION_ASSIGNED", onConversationAssigned);
      socket.off("CONVERSATION_TRANSFERRED", onConversationTransferred);
      socket.off("CONVERSATION_ENDED", onConversationEnded);
      socket.off("QUEUE_UPDATED", onQueueUpdated);
      socket.off("connect", onConnect);
      socket.off("reconnect", onReconnect);

      // Disconnect shared socket if no more subscribers
      if (socketRefCount === 0) {
        socket.disconnect();
        sharedStaffSocket = null;
      }
    };
  }, [apiKey, databaseName, tenantId, role, agentId]);

  return isConnectedRef.current;
};
