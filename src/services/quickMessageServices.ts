import { useMemo } from "react";
import useSWR from "swr";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import type {
  CreateQuickMessagePayload,
  CreateQuickMessageResponse,
  DeleteQuickMessageResponse,
  GetQuickMessageByIdResponse,
  GetQuickMessagesResponse,
  UpdateQuickMessagePayload,
  UpdateQuickMessageResponse,
  UseGetQuickMessagesParams,
} from "../models/QuickMessageModel";
import axiosServices, { fetcher } from "../utils/axios";

const endpoints = {
  key: `${API_BASE_URL}/quick-messages`,
};

export const useGetQuickMessages = (params: UseGetQuickMessagesParams = {}) => {
  const searchParams = new URLSearchParams();

  if (typeof params.page === "number") {
    searchParams.set("page", String(params.page));
  }

  if (typeof params.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }

  const queryString = searchParams.toString();
  const key = queryString ? `${endpoints.key}?${queryString}` : endpoints.key;

  const getQuickMessages = (url: string) =>
    fetcher<GetQuickMessagesResponse>(url, true) as Promise<GetQuickMessagesResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetQuickMessagesResponse>(
    key,
    getQuickMessages,
    SWR_OPTIONS
  );

  return useMemo(
    () => ({
      data,
      quickMessages: data?.quickMessages ?? [],
      isLoading,
      error,
      mutate,
    }),
    [data, isLoading, error, mutate]
  );
};

const quickMessageServices = {
  getQuickMessageById: async (quickMessageId: string): Promise<GetQuickMessageByIdResponse> => {
    const response = await axiosServices.get(`/quick-messages/${quickMessageId}`);
    return response.data;
  },

  createQuickMessage: async (payload: CreateQuickMessagePayload): Promise<CreateQuickMessageResponse> => {
    const response = await axiosServices.post("/quick-messages", payload);
    return response.data;
  },

  updateQuickMessage: async (
    quickMessageId: string,
    payload: UpdateQuickMessagePayload
  ): Promise<UpdateQuickMessageResponse> => {
    const response = await axiosServices.put(`/quick-messages/${quickMessageId}`, payload);
    return response.data;
  },

  deleteQuickMessage: async (quickMessageId: string): Promise<DeleteQuickMessageResponse> => {
    const response = await axiosServices.delete(`/quick-messages/${quickMessageId}`);
    return response.data;
  },
};

export default quickMessageServices;
