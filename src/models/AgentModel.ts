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
  configuration?: {
    planName?: string;
    price?: number;
    billingCycle?: string;
    interval?: number;
    limits?: {
      maxAgents?: number;
      hasAdvancedAnalytics?: boolean;
    };
    features?: string[];
  } | null;
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
  selfPickEligible?: boolean;
  selfPickEligibleAt?: string | null;
  selfPickConsumedAt?: string | null;
  averageRating?: number;
  ratingCount?: number;
};

export type AuthTenant = {
  id: string;
  companyName: string;
  companyCode: string;
  apiKey?: string | null;
  databaseName?: string | null;
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
  subscriptionUsage?: {
    usedAgents: number | null;
    maxAgents: number | null;
    remainingAgents: number | null;
    hasAdvancedAnalytics: boolean;
  } | null;
};

export type GetAgentsResponse = {
  success: boolean;
  message: string;
  agents: AuthAgent[];
  subscriptionUsage?: {
    usedAgents: number | null;
    maxAgents: number | null;
    remainingAgents: number | null;
    hasAdvancedAnalytics: boolean;
  } | null;
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
  ratingSummary?: {
    averageRating: number;
    ratingCount: number;
  } | null;
  feedbacks?: Array<{
    _id: string;
    rating: number;
    comment?: string | null;
    createdAt?: string;
    visitorId?: unknown;
    conversationId?: unknown;
  }>;
  ratingPagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
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

export type ForgotPasswordRequestData = {
  companyCode: string;
  emailAddress: string;
};

export type VerifyPasswordOTPData = {
  companyCode: string;
  emailAddress: string;
  otp: string;
};

export type ResetPasswordData = {
  companyCode: string;
  emailAddress: string;
  newPassword: string;
};

export type AuthMessageResponse = {
  success: boolean;
  message: string;
};