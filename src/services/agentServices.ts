import { useMemo } from "react";
import axiosServices, { fetcher } from "../utils/axios";
import type {
  AgentLoginResponse,
  AgentMeResponse,
  LoginData,
  CreateAgentsPayload,
  CreateAgentsResponse,
  GetAgentsResponse,
  UpdateAgentInput,
  UpdateAgentResponse,
  DeleteAgentResponse,
} from "../models/AgentModel";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import useSWR from "swr";

const endpoints = {
  key: `${API_BASE_URL}/agents`,
  me: `${API_BASE_URL}/agents/me`,
};

type UseGetAgentsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const useGetAgents = ({ page = 1, limit = 10, search = "" }: UseGetAgentsParams = {}) => {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
  });

  const key = `${endpoints.key}?${searchParams.toString()}`;
  const getAgents = (url: string) => fetcher<GetAgentsResponse>(url, true) as Promise<GetAgentsResponse>;

  const { data, isLoading, error, mutate } = useSWR<GetAgentsResponse>(
    key,
    getAgents,
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      data,
      agents: data?.agents ?? [],
      pagination: data?.pagination,
      isLoading,
      error,
      mutate,
    }),
    [data, isLoading, error, mutate]
  );

  return memoizedValue;
};

export const useGetSingleAgent = (agentId?: string) => {
  const isValid = Boolean(agentId);
  const key = isValid ? `${endpoints.key}/${agentId}` : null;
  const getAgent = (url: string) => fetcher<UpdateAgentResponse>(url, true) as Promise<UpdateAgentResponse>;

  const { data, isLoading, error, mutate } = useSWR<UpdateAgentResponse>(
    key,
    getAgent,
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      data,
      agent: data?.agent,
      isLoading,
      error,
      mutate,
    }),
    [data, isLoading, error, mutate]
  );

  return memoizedValue;
};

const Agents = {
  login: async (loginData: LoginData): Promise<AgentLoginResponse> => {
    try {
      const response = await axiosServices.post(`/agents/login`, loginData);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  getMe: async (): Promise<AgentMeResponse> => {
    const response = await axiosServices.get(endpoints.me);
    return response.data;
  },

  // Get all agents
  getAgents: async (
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ): Promise<GetAgentsResponse> => {
    const response = await axiosServices.get("/agents", {
      params: { page, limit, search },
    });
    return response.data;
  },

  // Get single agent
  getAgent: async (agentId: string): Promise<UpdateAgentResponse> => {
    const response = await axiosServices.get(`/agents/${agentId}`);
    return response.data;
  },

  // Create agents
  createAgents: async (
    payload: CreateAgentsPayload
  ): Promise<CreateAgentsResponse> => {
    const response = await axiosServices.post("/agents", payload);
    return response.data;
  },

  // Update agent
  updateAgent: async (
    agentId: string,
    data: UpdateAgentInput
  ): Promise<UpdateAgentResponse> => {
    const response = await axiosServices.put(`/agents/${agentId}`, data);
    return response.data;
  },

  // Delete agent
  deleteAgent: async (agentId: string): Promise<DeleteAgentResponse> => {
    const response = await axiosServices.delete(`/agents/${agentId}`);
    return response.data;
  },
};

export default Agents;