import axiosServices from "../utils/axios";
import type {
  GetConversationMessagesParams,
  GetLiveChatMessagesResponse,
  LiveChatSendMessagePayload,
  LiveChatStartConversationResponse,
  LiveChatWidgetConfig,
} from "../models/LiveChatModel";

const buildHeaders = (config: LiveChatWidgetConfig, visitorToken: string) => {
  const apiKey = String(config.apiKey || "").trim();

  return {
    "x-api-key": apiKey,
    "x-visitor-id": visitorToken,
  };
};

const WIDGET_BASE_PATH = "/widget/live-chat";

const liveChatWidgetServices = {
  startConversation: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
    payload: { name?: string; emailAddress?: string; message?: string } = {},
  ): Promise<LiveChatStartConversationResponse> => {
    const response = await axiosServices.post<LiveChatStartConversationResponse>(
      `${WIDGET_BASE_PATH}/conversations/start`,
      {
        ...payload,
        visitorToken,
      },
      {
        headers: buildHeaders(config, visitorToken),
      },
    );

    return response.data;
  },

  sendMessage: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
    payload: LiveChatSendMessagePayload,
  ): Promise<unknown> => {
    const response = await axiosServices.post(
      `${WIDGET_BASE_PATH}/messages`,
      {
        ...payload,
        senderType: "VISITOR",
        senderId: visitorToken,
      },
      {
        headers: buildHeaders(config, visitorToken),
      },
    );

    return response.data;
  },

  getConversationMessages: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
    conversationId: string,
    params: GetConversationMessagesParams = {},
  ): Promise<GetLiveChatMessagesResponse> => {
    const messagesResponse = await axiosServices.get<GetLiveChatMessagesResponse>(`${WIDGET_BASE_PATH}/messages/${conversationId}`, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
      },
      headers: buildHeaders(config, visitorToken),
    });

    return messagesResponse.data;
  },
};

export default liveChatWidgetServices;