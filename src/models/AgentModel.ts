export type LoginData = {
  companyCode: string;
  emailAddress: string;
  password: string;
};

export interface Subscription {
  planName: string;
  startDate: string;
  endDate: string;
}

export interface SubscriptionData {
  id: string;
  tenantId: string;
  subscriptionPlanId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export type UserRole = "MASTER_ADMIN" | "ADMIN" | "SUPPORT_AGENT" | "VISITOR";

export interface AuthUser {
  companyName: string;
  role: UserRole;
  subscription: Subscription;
}

export type AuthAgent = {
  _id: string;
  fullName: string;
  emailAddress: string;
  role: UserRole;
  phoneNumber?: string | null;
  profilePicture?: string | null;
  status?: string;
};

export type AuthTenant = {
  id: string;
  companyName: string;
  companyCode: string;
  apiKey?: string | null;
  subscription?: Subscription | null;
  subscriptionData?: SubscriptionData | null;
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

export type AgentMeResponse = {
  success: boolean;
  message: string;
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
  logout: () => Promise<void>;
  updateUser: (agent: AuthAgent) => void;
  refreshSession: () => Promise<void>;
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
  password?: string;
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

export type VerifyPasswordResponse = {
  success: boolean;
  message: string;
  verified: boolean;
};