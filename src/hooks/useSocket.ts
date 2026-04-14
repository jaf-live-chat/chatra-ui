import { useEffect, useRef, useCallback, useState } from "react";
import type { Socket } from "socket.io-client";
import { createLiveChatSocket } from "../services/liveChatRealtimeClient";

export type SocketQueryParams = {
  apiKey?: string;
  databaseName?: string;
  tenantId?: string;
  role?: string;
  agentId?: string;
  visitorToken?: string;
  conversationId?: string;
};

export type SocketStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

/**
 * Low-level hook for managing a single WebSocket connection.
 * Handles connection lifecycle, reconnection, and event management.
 * 
 * @param query - Socket.IO query parameters for authentication
 * @param onConnect - Callback when socket connects
 * @param onDisconnect - Callback when socket disconnects
 * @param onError - Callback when connection error occurs
 * @returns Object with socket, status, emit, and on/off methods
 */
export const useSocket = (
  query?: SocketQueryParams,
  callbacks?: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
  }
) => {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("idle");
  const isInitializedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    if (isInitializedRef.current || !query) {
      return;
    }

    isInitializedRef.current = true;
    setStatus("connecting");

    try {
      const socket = createLiveChatSocket(query);

      if (!socket) {
        setStatus("error");
        callbacks?.onError?.(new Error("Socket.IO client not supported"));
        return;
      }

      socketRef.current = socket;

      socket.on("connect", () => {
        setStatus("connected");
        callbacks?.onConnect?.();
      });

      socket.on("disconnect", () => {
        setStatus("disconnected");
        callbacks?.onDisconnect?.();
      });

      socket.on("connect_error", (error) => {
        setStatus("error");
        callbacks?.onError?.(error instanceof Error ? error : new Error(String(error)));
      });

      socket.on("PONG", () => {
        // Ping-pong keeps connection alive
      });
    } catch (error) {
      setStatus("error");
      callbacks?.onError?.(error instanceof Error ? error : new Error(String(error)));
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [query?.apiKey, query?.conversationId, query?.agentId, query?.databaseName, query?.role, query?.tenantId, query?.visitorToken, callbacks]);

  // Emit an event to the server
  const emit = useCallback(
    (event: string, data?: any) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, data);
      }
    },
    []
  );

  // Listen to an event from the server
  const on = useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      if (socketRef.current) {
        socketRef.current.on(event, handler);
      }
    },
    []
  );

  // Stop listening to an event
  const off = useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    },
    []
  );

  // Check if socket is connected
  const isConnected = status === "connected" && socketRef.current?.connected;

  return {
    socket: socketRef.current,
    status,
    isConnected,
    emit,
    on,
    off,
  };
};
