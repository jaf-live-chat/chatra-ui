import axiosServices from "../utils/axios";
import type {
  AgentLoginResponse,
  LoginData,
  CreateAgentsPayload,
  CreateAgentsResponse,
  GetAgentsResponse,
  UpdateAgentInput,
  UpdateAgentResponse,
  DeleteAgentResponse,
} from "../models/AgentModel";

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