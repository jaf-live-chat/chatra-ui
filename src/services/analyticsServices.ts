import { useMemo } from "react";
import useSWR from "swr";
import { SWR_OPTIONS } from "../constants/constants";
import type {
  GetLiveChatAnalyticsSummaryResponse,
  LiveChatAnalytics,
} from "../models/AnalyticsModel";
import axiosServices, { fetcher } from "../utils/axios";

const analyticsServices = {
  getSummary: async (days = 7): Promise<GetLiveChatAnalyticsSummaryResponse> => {
    const response = await axiosServices.get<GetLiveChatAnalyticsSummaryResponse>("/analytics/summary", {
      params: { days },
    });

    return response.data;
  },
};

type UseGetLiveChatAnalyticsParams = {
  days?: number;
};

export const useGetLiveChatAnalytics = ({ days = 7 }: UseGetLiveChatAnalyticsParams = {}) => {
  const key = `/analytics/summary?days=${days}`;
  const getSummary = (url: string) => fetcher<GetLiveChatAnalyticsSummaryResponse>(url, true) as Promise<GetLiveChatAnalyticsSummaryResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetLiveChatAnalyticsSummaryResponse>(
    key,
    getSummary,
    SWR_OPTIONS,
  );

  const memoizedValue = useMemo(
    () => ({
      data,
      analytics: (data?.analytics as LiveChatAnalytics | undefined) ?? null,
      isLoading,
      error,
      mutate,
    }),
    [data, isLoading, error, mutate],
  );

  return memoizedValue;
};

export default analyticsServices;
