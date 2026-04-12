import axiosServices from "../utils/axios";
import type { AxiosRequestConfig } from "axios";
import type {
  GetActiveLiveChatResponse,
  GetConversationMessagesParams,
  GetLiveChatHistoryResponse,
  GetLiveChatMessagesResponse,
  GetLiveChatQueueParams,
  GetLiveChatQueueResponse,
  LiveChatParticipantRole,
  LiveChatStartConversationResponse,
} from "../models/LiveChatModel";

type LiveChatMutationRequestOptions = AxiosRequestConfig & {
  skipGlobalBlocking?: boolean;
  loadingMessage?: string;
};

const liveChatServices = {
  getQueue: async ({ page = 1, limit = 20 }: GetLiveChatQueueParams = {}): Promise<GetLiveChatQueueResponse> => {
    const response = await axiosServices.get<GetLiveChatQueueResponse>("/queue", {
      params: { page, limit },
    });

    return response.data;
  },

  getActiveConversations: async ({ page = 1, limit = 20 }: GetLiveChatQueueParams = {}): Promise<GetActiveLiveChatResponse> => {
    const response = await axiosServices.get<GetActiveLiveChatResponse>("/conversations/active", {
      params: { page, limit },
    });

    return response.data;
  },

  getConversationHistory: async ({ page = 1, limit = 20 }: GetLiveChatQueueParams = {}): Promise<GetLiveChatHistoryResponse> => {
    const response = await axiosServices.get<GetLiveChatHistoryResponse>("/conversations/history", {
      params: { page, limit },
    });

    return response.data;
  },

  assignConversation: async (conversationId: string, agentId: string): Promise<LiveChatStartConversationResponse> => {
    const response = await axiosServices.post<LiveChatStartConversationResponse>(
      `/conversations/${conversationId}/assign`,
      { agentId },
    );

    return response.data;
  },

  acceptConversation: async (conversationId: string): Promise<LiveChatStartConversationResponse> => {
    const response = await axiosServices.post<LiveChatStartConversationResponse>(`/conversations/${conversationId}/accept`);
    return response.data;
  },

  transferConversation: async (conversationId: string, agentId: string): Promise<LiveChatStartConversationResponse> => {
    const response = await axiosServices.post<LiveChatStartConversationResponse>(
      `/conversations/${conversationId}/transfer`,
      { agentId },
    );

    return response.data;
  },

  endConversation: async (
    conversationId: string,
    requestConfig?: LiveChatMutationRequestOptions,
  ): Promise<LiveChatStartConversationResponse> => {
    const response = await axiosServices.post<LiveChatStartConversationResponse>(
      `/conversations/${conversationId}/end`,
      undefined,
      requestConfig,
    );
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    message: string,
    senderType: LiveChatParticipantRole,
    senderId: string,
    requestConfig?: LiveChatMutationRequestOptions,
  ): Promise<unknown> => {
    const response = await axiosServices.post(
      "/messages",
      {
        conversationId,
        message,
        senderType,
        senderId,
      },
      requestConfig,
    );

    return response.data;
  },

  getConversationMessages: async (
    conversationId: string,
    { page = 1, limit = 100 }: GetConversationMessagesParams = {},
  ): Promise<GetLiveChatMessagesResponse> => {
    const response = await axiosServices.get<GetLiveChatMessagesResponse>(`/messages/${conversationId}`, {
      params: { page, limit },
    });

    return response.data;
  },
};

export default liveChatServices;
