import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  AgentLoginResponse,
  AuthContextValue,
  AuthSession,
  LoginData,
} from "../models/AgentModel";
import Agents from "../services/agentServices";

const AUTH_STORAGE_KEY = "jaf_auth_session";
const TOKEN_STORAGE_KEY = "serviceToken";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as AuthSession;

    if (!parsed?.accessToken || !parsed?.agent) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession);

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_STORAGE_KEY, session.accessToken);
  }, [session]);

  const login = useCallback(async (loginData: LoginData): Promise<AgentLoginResponse> => {
    const response = await Agents.login(loginData);

    const nextSession: AuthSession = {
      accessToken: response.accessToken,
      tokenType: response.tokenType,
      expiresIn: response.expiresIn,
      tenant: response.tenant,
      agent: response.agent,
    };

    setSession(nextSession);

    return response;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.agent ?? null,
      tenant: session?.tenant ?? null,
      accessToken: session?.accessToken ?? null,
      isLoggedIn: Boolean(session?.accessToken && session?.agent),
      login,
      logout,
    }),
    [session, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
