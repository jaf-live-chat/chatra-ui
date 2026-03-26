export type LoginData = {
  companyCode: string;
  emailAddress: string;
  password: string;
};

export type AuthAgent = {
  _id: string;
  fullName: string;
  emailAddress: string;
  role: string;
  phoneNumber?: string | null;
  profilePicture?: string | null;
  status?: string;
};

export type AuthTenant = {
  id: string;
  companyName: string;
  companyCode: string;
};

export type AgentLoginResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  tenant: AuthTenant;
  agent: AuthAgent;
};

export type AuthSession = {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  tenant: AuthTenant;
  agent: AuthAgent;
};

export type AuthContextValue = {
  user: AuthAgent | null;
  tenant: AuthTenant | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  login: (loginData: LoginData) => Promise<AgentLoginResponse>;
  logout: () => void;
};

// Agent CRUD Operations
export type CreateAgentInput = {
  fullName: string;
  emailAddress: string;
  password: string;
  role: string;
  phoneNumber?: string | null;
  profilePicture?: string | null;
};

export type CreateAgentsPayload = {
  agents: CreateAgentInput[];
};

export type CreateAgentsResponse = {
  success: boolean;
  message: string;
  agents: AuthAgent[];
};

export type GetAgentsResponse = {
  success: boolean;
  message: string;
  agents: AuthAgent[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
};

export type UpdateAgentInput = {
  fullName?: string;
  emailAddress?: string;
  phoneNumber?: string | null;
  profilePicture?: string | null;
  role?: string;
  status?: string;
};

export type UpdateAgentResponse = {
  success: boolean;
  message: string;
  agent: AuthAgent;
};

export type DeleteAgentResponse = {
  success: boolean;
  message: string;
};