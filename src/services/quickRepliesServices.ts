import { useMemo } from "react";
import useSWR from "swr";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import type {
  CreateQuickReplyPayload,
  CreateQuickReplyResponse,
  DeleteQuickReplyResponse,
  GetQuickReplyByIdResponse,
  GetQuickRepliesResponse,
  UpdateQuickReplyPayload,
  UpdateQuickReplyResponse,
  UseGetQuickRepliesParams,
} from "../models/QuickReplyModel";
import axiosServices, { fetcher } from "../utils/axios";

const endpoints = {
  key: `${API_BASE_URL}/quick-replies`,
};

export const useGetQuickReplies = ({
  page = 1,
  limit = 100,
  search = "",
  category = "",
  isPosted,
}: UseGetQuickRepliesParams = {}) => {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) {
    searchParams.set("search", search);
  }

  if (category && category !== "All") {
    searchParams.set("category", category);
  }

  if (typeof isPosted === "boolean") {
    searchParams.set("isPosted", String(isPosted));
  }

  const key = `${endpoints.key}?${searchParams.toString()}`;
  const getQuickReplies = (url: string) =>
    fetcher<GetQuickRepliesResponse>(url, true) as Promise<GetQuickRepliesResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetQuickRepliesResponse>(
    key,
    getQuickReplies,
    SWR_OPTIONS
  );

  return useMemo(
    () => ({
      data,
      quickReplies: data?.quickReplies ?? [],
      pagination: data?.pagination,
      isLoading,
      error,
      mutate,
    }),
    [data, isLoading, error, mutate]
  );
};

const quickRepliesServices = {
  getQuickReplyById: async (quickReplyId: string): Promise<GetQuickReplyByIdResponse> => {
    const response = await axiosServices.get(`/quick-replies/${quickReplyId}`);
    return response.data;
  },

  createQuickReply: async (payload: CreateQuickReplyPayload): Promise<CreateQuickReplyResponse> => {
    const response = await axiosServices.post("/quick-replies", payload);
    return response.data;
  },

  updateQuickReply: async (
    quickReplyId: string,
    payload: UpdateQuickReplyPayload
  ): Promise<UpdateQuickReplyResponse> => {
    const response = await axiosServices.put(`/quick-replies/${quickReplyId}`, payload);
    return response.data;
  },

  deleteQuickReply: async (quickReplyId: string): Promise<DeleteQuickReplyResponse> => {
    const response = await axiosServices.delete(`/quick-replies/${quickReplyId}`);
    return response.data;
  },
};

export default quickRepliesServices;