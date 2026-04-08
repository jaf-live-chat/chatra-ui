import { useMemo } from "react";
import useSWR from "swr";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import axiosServices, { fetcher } from "../utils/axios";
import type {
  UpdateQueueAssignmentModePayload,
  UpdateQueueAssignmentModeResponse,
  GetQueueAssignmentModeResponse,
} from "../models/ChatSettingsModel";

const endpoints = {
  assignmentMode: `${API_BASE_URL}/chat-settings/assignment-mode`,
};

export const useGetQueueAssignmentMode = () => {
  const getAssignmentMode = (url: string) =>
    fetcher<GetQueueAssignmentModeResponse>(url, true) as Promise<GetQueueAssignmentModeResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetQueueAssignmentModeResponse>(
    endpoints.assignmentMode,
    getAssignmentMode,
    SWR_OPTIONS
  );

  return useMemo(
    () => ({
      data,
      chatSettings: data?.chatSettings,
      isLoading,
      error,
      mutate,
    }),
    [data, isLoading, error, mutate]
  );
};

const chatSettingsServices = {
  getQueueAssignmentMode: async (): Promise<GetQueueAssignmentModeResponse> => {
    const response = await axiosServices.get("/chat-settings/assignment-mode");
    return response.data;
  },

  updateQueueAssignmentMode: async (
    payload: UpdateQueueAssignmentModePayload
  ): Promise<UpdateQueueAssignmentModeResponse> => {
    const response = await axiosServices.patch("/chat-settings/assignment-mode", payload);
    return response.data;
  },
};

export default chatSettingsServices;
