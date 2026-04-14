import { useMemo } from "react";
import useSWR from "swr";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import { fetcher } from "../utils/axios";
import type {
  GetVisitorDetailsParams,
  GetVisitorDetailsResponse,
  GetVisitorsParams,
  GetVisitorsResponse,
} from "../models/VisitorModel";

const endpoints = {
  visitors: `${API_BASE_URL}/visitors`,
  visitorById: (visitorId: string) => `${API_BASE_URL}/visitors/${visitorId}`,
};

export const useGetVisitors = ({ page = 1, limit = 10, search = "" }: GetVisitorsParams = {}) => {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
  });

  const key = `${endpoints.visitors}?${searchParams.toString()}`;

  const getVisitors = (url: string) =>
    fetcher<GetVisitorsResponse>(url, true) as Promise<GetVisitorsResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetVisitorsResponse>(
    key,
    getVisitors,
    SWR_OPTIONS,
  );

  return useMemo(
    () => ({
      data,
      visitors: data?.visitors ?? [],
      pagination: data?.pagination,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate],
  );
};

export const useGetVisitorDetails = (
  visitorId?: string,
  { page = 1, limit = 8 }: GetVisitorDetailsParams = {},
) => {
  const isValid = Boolean(visitorId);
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const key = isValid
    ? `${endpoints.visitorById(String(visitorId))}?${searchParams.toString()}`
    : null;

  const getVisitorDetails = (url: string) =>
    fetcher<GetVisitorDetailsResponse>(url, true) as Promise<GetVisitorDetailsResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetVisitorDetailsResponse>(
    key,
    getVisitorDetails,
    SWR_OPTIONS,
  );

  return useMemo(
    () => ({
      data,
      visitor: data?.visitor ?? null,
      conversations: data?.conversations ?? [],
      pagination: data?.pagination,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate],
  );
};
