import { useMemo } from "react";
import useSWR from "swr";
import axiosServices, { fetcher } from "../utils/axios";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import type {
  CreateFaqPayload,
  GetFaqsResponse,
  MutationFaqResponse,
  ReorderFaqPayload,
  ReorderFaqResponse,
  SingleFaqResponse,
  UpdateFaqPayload,
} from "../models/FaqModel";

const endpoints = {
  key: `${API_BASE_URL}/faqs`,
};

export const useGetFaqs = () => {
  const getFaqs = (url: string) => fetcher<GetFaqsResponse>(url, true) as Promise<GetFaqsResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetFaqsResponse>(
    endpoints.key,
    getFaqs,
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      data,
      faqs: data?.faqs ?? [],
      count: data?.count ?? 0,
      isLoading,
      error,
      mutate,
    }),
    [data, isLoading, error, mutate]
  );

  return memoizedValue;
};

export const getFaqById = async (id: string): Promise<SingleFaqResponse> => {
  const response = await axiosServices.get(`/faqs/${id}`);
  return response.data;
};

export const createFaq = async (payload: CreateFaqPayload): Promise<MutationFaqResponse> => {
  const response = await axiosServices.post("/faqs", payload);
  return response.data;
};

export const updateFaqById = async (
  id: string,
  payload: UpdateFaqPayload
): Promise<MutationFaqResponse> => {
  const response = await axiosServices.put(`/faqs/${id}`, payload);
  return response.data;
};

export const deleteFaqById = async (id: string): Promise<MutationFaqResponse> => {
  const response = await axiosServices.delete(`/faqs/${id}`);
  return response.data;
};

export const reorderFaqs = async (payload: ReorderFaqPayload): Promise<ReorderFaqResponse> => {
  const response = await axiosServices.patch("/faqs/reorder", payload);
  return response.data;
};
