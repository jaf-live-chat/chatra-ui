import { useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { createLiveChatSocket } from "../services/liveChatRealtimeClient";
import type { LiveChatMessage, LiveChatConversationEndedEvent } from "../models/LiveChatModel";

export interface StaffLiveChatHandlers {
  onNewMessage?: (message: LiveChatMessage) => void;
  onMessageStatusUpdated?: (payload: { conversationId?: string; messageIds?: string[]; status?: "DELIVERED" | "SEEN"; seenByRole?: string | null }) => void;
  onConversationAssigned?: (payload: any) => void;
  onConversationTransferred?: (payload: any) => void;
  onConversationEnded?: (payload: LiveChatConversationEndedEvent) => void;
  onQueueUpdated?: (payload: any) => void;
  onAgentStatusUpdated?: (payload: any) => void;
  onTyping?: (payload: { conversationId: string; senderId: string; senderRole: string }) => void;
  onStopTyping?: (payload: { conversationId: string; senderId: string; senderRole: string }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onError?: (error: Error) => void;
}

let sharedStaffSocket: Socket | null = null;
let socketRefCount = 0;

type StaffTypingEventName = "TYPING" | "STOP_TYPING";

export const emitStaffLiveChatTyping = (eventName: StaffTypingEventName, conversationId?: string | null) => {
  const resolvedConversationId = String(conversationId || "").trim();

  if (!resolvedConversationId || !sharedStaffSocket || !sharedStaffSocket.connected) {
    return;
  }

  sharedStaffSocket.emit(eventName, { conversationId: resolvedConversationId });
};

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

      const onConversationAssigned = (payload: any) => {
        handlersRef.current.onConversationAssigned?.(payload);
      };

      const onConversationTransferred = (payload: any) => {
        handlersRef.current.onConversationTransferred?.(payload);
      };

      const onConversationEnded = (payload: LiveChatConversationEndedEvent) => {
        handlersRef.current.onConversationEnded?.(payload);
      };

      const onQueueUpdated = (payload: any) => {
        handlersRef.current.onQueueUpdated?.(payload);
      };

      const onAgentStatusUpdated = (payload: any) => {
        handlersRef.current.onAgentStatusUpdated?.(payload);
      };

      const onTyping = (payload: any) => {
        handlersRef.current.onTyping?.(payload);
      };

      const onStopTyping = (payload: any) => {
        handlersRef.current.onStopTyping?.(payload);
      };

      const onConnect = () => {
        isConnectedRef.current = true;
        handlersRef.current.onConnect?.();
      };

      const onDisconnect = () => {
        isConnectedRef.current = false;
        handlersRef.current.onDisconnect?.();
      };

      const onReconnect = () => {
        isConnectedRef.current = true;
        handlersRef.current.onReconnect?.();
      };

      const onError = (error: any) => {
        handlersRef.current.onError?.(error instanceof Error ? error : new Error(String(error)));
      };

      sharedStaffSocket.on("NEW_MESSAGE", onNewMessage);
      sharedStaffSocket.on("MESSAGE_STATUS_UPDATED", onMessageStatusUpdated);
      sharedStaffSocket.on("CONVERSATION_ASSIGNED", onConversationAssigned);
      sharedStaffSocket.on("CONVERSATION_TRANSFERRED", onConversationTransferred);
      sharedStaffSocket.on("CONVERSATION_ENDED", onConversationEnded);
      sharedStaffSocket.on("QUEUE_UPDATED", onQueueUpdated);
      sharedStaffSocket.on("AGENT_STATUS_UPDATED", onAgentStatusUpdated);
      sharedStaffSocket.on("TYPING", onTyping);
      sharedStaffSocket.on("STOP_TYPING", onStopTyping);
      sharedStaffSocket.on("connect", onConnect);
      sharedStaffSocket.on("disconnect", onDisconnect);
      sharedStaffSocket.on("reconnect", onReconnect);
      sharedStaffSocket.on("connect_error", onError);

      return () => {
        socketRefCount -= 1;

        sharedStaffSocket?.off("NEW_MESSAGE", onNewMessage);
        sharedStaffSocket?.off("MESSAGE_STATUS_UPDATED", onMessageStatusUpdated);
        sharedStaffSocket?.off("CONVERSATION_ASSIGNED", onConversationAssigned);
        sharedStaffSocket?.off("CONVERSATION_TRANSFERRED", onConversationTransferred);
        sharedStaffSocket?.off("CONVERSATION_ENDED", onConversationEnded);
        sharedStaffSocket?.off("QUEUE_UPDATED", onQueueUpdated);
        sharedStaffSocket?.off("AGENT_STATUS_UPDATED", onAgentStatusUpdated);
        sharedStaffSocket?.off("TYPING", onTyping);
        sharedStaffSocket?.off("STOP_TYPING", onStopTyping);
        sharedStaffSocket?.off("connect", onConnect);
        sharedStaffSocket?.off("disconnect", onDisconnect);
        sharedStaffSocket?.off("reconnect", onReconnect);
        sharedStaffSocket?.off("connect_error", onError);

        // Disconnect shared socket if no more subscribers
        if (socketRefCount === 0 && sharedStaffSocket) {
          sharedStaffSocket.disconnect();
          sharedStaffSocket = null;
        }
      };
    }

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

    // Create new shared socket
    socketRefCount = 1;
    sharedStaffSocket = socket;

    const onNewMessage = (message: LiveChatMessage) => {
      handlersRef.current.onNewMessage?.(message);
    };

    const onMessageStatusUpdated = (payload: any) => {
      handlersRef.current.onMessageStatusUpdated?.(payload);
    };

    const onConversationAssigned = (payload: any) => {
      handlersRef.current.onConversationAssigned?.(payload);
    };

    const onConversationTransferred = (payload: any) => {
      handlersRef.current.onConversationTransferred?.(payload);
    };

    const onConversationEnded = (payload: LiveChatConversationEndedEvent) => {
      handlersRef.current.onConversationEnded?.(payload);
    };

    const onQueueUpdated = (payload: any) => {
      handlersRef.current.onQueueUpdated?.(payload);
    };

    const onAgentStatusUpdated = (payload: any) => {
      handlersRef.current.onAgentStatusUpdated?.(payload);
    };

    const onTyping = (payload: any) => {
      handlersRef.current.onTyping?.(payload);
    };

    const onStopTyping = (payload: any) => {
      handlersRef.current.onStopTyping?.(payload);
    };

    const onConnect = () => {
      isConnectedRef.current = true;
      handlersRef.current.onConnect?.();
    };

    const onDisconnect = () => {
      isConnectedRef.current = false;
      handlersRef.current.onDisconnect?.();
    };

    const onReconnect = () => {
      isConnectedRef.current = true;
      handlersRef.current.onReconnect?.();
    };

    const onError = (error: any) => {
      handlersRef.current.onError?.(error instanceof Error ? error : new Error(String(error)));
    };

    socket.on("NEW_MESSAGE", onNewMessage);
    socket.on("MESSAGE_STATUS_UPDATED", onMessageStatusUpdated);
    socket.on("CONVERSATION_ASSIGNED", onConversationAssigned);
    socket.on("CONVERSATION_TRANSFERRED", onConversationTransferred);
    socket.on("CONVERSATION_ENDED", onConversationEnded);
    socket.on("QUEUE_UPDATED", onQueueUpdated);
    socket.on("AGENT_STATUS_UPDATED", onAgentStatusUpdated);
    socket.on("TYPING", onTyping);
    socket.on("STOP_TYPING", onStopTyping);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect", onReconnect);
    socket.on("connect_error", onError);

    return () => {
      socketRefCount -= 1;

      socket.off("NEW_MESSAGE", onNewMessage);
      socket.off("MESSAGE_STATUS_UPDATED", onMessageStatusUpdated);
      socket.off("CONVERSATION_ASSIGNED", onConversationAssigned);
      socket.off("CONVERSATION_TRANSFERRED", onConversationTransferred);
      socket.off("CONVERSATION_ENDED", onConversationEnded);
      socket.off("QUEUE_UPDATED", onQueueUpdated);
      socket.off("AGENT_STATUS_UPDATED", onAgentStatusUpdated);
      socket.off("TYPING", onTyping);
      socket.off("STOP_TYPING", onStopTyping);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect", onReconnect);
      socket.off("connect_error", onError);

      // Disconnect shared socket if no more subscribers
      if (socketRefCount === 0) {
        socket.disconnect();
        sharedStaffSocket = null;
      }
    };
  }, [apiKey, databaseName, tenantId, role, agentId]);

  return isConnectedRef.current;
};
