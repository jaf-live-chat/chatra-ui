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