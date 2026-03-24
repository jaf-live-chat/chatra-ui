import axiosServices from "../utils/axios";
import type { AgentLoginResponse, LoginData } from "../models/AgentModel";

const Agents = {
  login: async (loginData: LoginData): Promise<AgentLoginResponse> => {
    try {
      const response = await axiosServices.post(`/agents/login`, loginData);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
}

export default Agents;