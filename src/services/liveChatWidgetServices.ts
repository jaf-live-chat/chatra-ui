import axiosServices from "../utils/axios";
import type {
  GetConversationMessagesParams,
  GetWidgetConversationHistoryResponse,
  GetLiveChatMessagesResponse,
  GetWidgetQuickMessagesResponse,
  GetWidgetSettingsResponse,
  GetWidgetVisitorProfileResponse,
  LiveChatEndConversationResponse,
  LiveChatSendMessagePayload,
  LiveChatStartConversationResponse,
  LiveChatSubmitFeedbackPayload,
  LiveChatSubmitFeedbackResponse,
  UpdateWidgetVisitorProfilePayload,
  UpdateWidgetVisitorProfileResponse,
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
    payload: {
      fullName?: string;
      name?: string;
      emailAddress?: string;
      phoneNumber?: string;
      message?: string;
      locationConsent?: boolean;
      ipAddressConsent?: boolean;
      browserLatitude?: number;
      browserLongitude?: number;
    } = {},
  ): Promise<LiveChatStartConversationResponse> => {
    const normalizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => {
        if (typeof value === "string") {
          return value.trim().length > 0;
        }

        return value !== undefined && value !== null;
      }),
    );

    const response = await axiosServices.post<LiveChatStartConversationResponse>(
      `${WIDGET_BASE_PATH}/conversations/start`,
      {
        ...normalizedPayload,
        visitorToken,
      },
      {
        headers: buildHeaders(config, visitorToken),
      },
    );

    return response.data;
  },

  endConversation: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
    conversationId: string,
  ): Promise<LiveChatEndConversationResponse> => {
    const response = await axiosServices.post<LiveChatEndConversationResponse>(
      `${WIDGET_BASE_PATH}/conversations/${conversationId}/end`,
      {
        visitorToken,
      },
      {
        headers: buildHeaders(config, visitorToken),
      },
    );

    return response.data;
  },

  submitConversationFeedback: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
    conversationId: string,
    payload: LiveChatSubmitFeedbackPayload,
  ): Promise<LiveChatSubmitFeedbackResponse> => {
    const response = await axiosServices.post<LiveChatSubmitFeedbackResponse>(
      `${WIDGET_BASE_PATH}/conversations/${conversationId}/feedback`,
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

  getConversationHistory: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
    params: GetConversationMessagesParams = {},
  ): Promise<GetWidgetConversationHistoryResponse> => {
    const response = await axiosServices.get<GetWidgetConversationHistoryResponse>(`${WIDGET_BASE_PATH}/conversations/history`, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
      headers: buildHeaders(config, visitorToken),
    });

    return response.data;
  },

  getVisitorProfile: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
  ): Promise<GetWidgetVisitorProfileResponse> => {
    const response = await axiosServices.get<GetWidgetVisitorProfileResponse>(`${WIDGET_BASE_PATH}/visitor-profile`, {
      headers: buildHeaders(config, visitorToken),
    });

    return response.data;
  },

  updateVisitorProfile: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
    payload: UpdateWidgetVisitorProfilePayload,
  ): Promise<UpdateWidgetVisitorProfileResponse> => {
    const response = await axiosServices.patch<UpdateWidgetVisitorProfileResponse>(
      `${WIDGET_BASE_PATH}/visitor-profile`,
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

  getQuickMessages: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
    params: GetConversationMessagesParams = {},
  ): Promise<GetWidgetQuickMessagesResponse> => {
    const response = await axiosServices.get<GetWidgetQuickMessagesResponse>(`${WIDGET_BASE_PATH}/quick-messages`, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
      headers: buildHeaders(config, visitorToken),
    });

    return response.data;
  },

  getWidgetSettings: async (
    config: LiveChatWidgetConfig,
    visitorToken: string,
  ): Promise<GetWidgetSettingsResponse> => {
    const response = await axiosServices.get<GetWidgetSettingsResponse>(`${WIDGET_BASE_PATH}/settings`, {
      headers: buildHeaders(config, visitorToken),
    });

    return response.data;
  },
};

export default liveChatWidgetServices;