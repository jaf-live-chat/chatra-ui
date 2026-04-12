import { useMemo } from "react";
import useSWR from "swr";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import { fetcher } from "../utils/axios";
import type {
  GetActiveLiveChatResponse,
  GetConversationMessagesParams,
  GetLiveChatHistoryResponse,
  GetLiveChatMessagesResponse,
  GetLiveChatQueueParams,
  GetLiveChatQueueResponse,
} from "../models/LiveChatModel";

const endpoints = {
  queue: `${API_BASE_URL}/queue`,
  activeConversations: `${API_BASE_URL}/conversations/active`,
  conversationHistory: `${API_BASE_URL}/conversations/history`,
  messages: (conversationId: string) => `${API_BASE_URL}/messages/${conversationId}`,
};

export const useGetLiveChatQueue = ({ page = 1, limit = 10 }: GetLiveChatQueueParams = {}) => {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const key = `${endpoints.queue}?${searchParams.toString()}`;

  const getQueue = (url: string) =>
    fetcher<GetLiveChatQueueResponse>(url, true) as Promise<GetLiveChatQueueResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetLiveChatQueueResponse>(
    key,
    getQueue,
    SWR_OPTIONS,
  );

  return useMemo(
    () => ({
      data,
      queue: data?.queue ?? [],
      pagination: data?.pagination,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate],
  );
};

export const useGetActiveLiveChat = ({ page = 1, limit = 10 }: GetLiveChatQueueParams = {}) => {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const key = `${endpoints.activeConversations}?${searchParams.toString()}`;

  const getActiveLiveChat = (url: string) =>
    fetcher<GetActiveLiveChatResponse>(url, true) as Promise<GetActiveLiveChatResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetActiveLiveChatResponse>(
    key,
    getActiveLiveChat,
    SWR_OPTIONS,
  );

  return useMemo(
    () => ({
      data,
      queue: data?.queue ?? [],
      pagination: data?.pagination,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate],
  );
};

export const useGetLiveChatHistory = ({ page = 1, limit = 10 }: GetLiveChatQueueParams = {}) => {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const key = `${endpoints.conversationHistory}?${searchParams.toString()}`;

  const getLiveChatHistory = (url: string) =>
    fetcher<GetLiveChatHistoryResponse>(url, true) as Promise<GetLiveChatHistoryResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetLiveChatHistoryResponse>(
    key,
    getLiveChatHistory,
    SWR_OPTIONS,
  );

  return useMemo(
    () => ({
      data,
      conversations: data?.conversations ?? [],
      pagination: data?.pagination,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate],
  );
};

export const useGetConversationMessages = (
  conversationId?: string,
  { page = 1, limit = 50 }: GetConversationMessagesParams = {},
) => {
  const isValid = Boolean(conversationId);

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const key = isValid && conversationId ? `${endpoints.messages(conversationId)}?${searchParams.toString()}` : null;

  const getMessages = (url: string) =>
    fetcher<GetLiveChatMessagesResponse>(url, true) as Promise<GetLiveChatMessagesResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetLiveChatMessagesResponse>(
    key,
    getMessages,
    SWR_OPTIONS,
  );

  return useMemo(
    () => ({
      data,
      messages: data?.messages ?? [],
      pagination: data?.pagination,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate],
  );
};