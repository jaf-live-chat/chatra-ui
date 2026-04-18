import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import type {
  AgentLoginResponse,
  AuthAgent,
  AuthContextValue,
  AuthSession,
  LoginData,
} from "../models/AgentModel";
import Agents from "../services/agentServices";
import { SUBSCRIPTION_STATE_CHANGED_EVENT } from "../utils/subscriptionAccess";

const AUTH_STORAGE_KEY = "jaf_auth_session";
const TOKEN_STORAGE_KEY = "serviceToken";
const AUTH_UNAUTHORIZED_EVENT = "jaf_auth_unauthorized";

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

  const clearSession = useCallback(() => {
    setSession(null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }

    try {
      const meResponse = await Agents.getMe();

      setSession((prevSession) => {
        if (!prevSession) {
          return prevSession;
        }

        return {
          ...prevSession,
          tenant: meResponse.tenant,
          agent: meResponse.agent,
        };
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearSession();
        return;
      }

      // Keep existing session for transient refresh failures.
    }
  }, [clearSession, session?.accessToken]);

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_STORAGE_KEY, session.accessToken);
  }, [session]);

  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    refreshSession();

    const intervalId = window.setInterval(() => {
      refreshSession();
    }, 60000);

    const handleWindowFocus = () => {
      refreshSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSession();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshSession, session?.accessToken]);

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

  const logout = useCallback(async () => {
    try {
      if (session?.accessToken) {
        await Agents.logout();
      }
    } catch {
      // Always clear local session even if API logout fails.
    } finally {
      clearSession();
    }
  }, [clearSession, session?.accessToken]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };

    const handleSubscriptionStateChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{
        isActive?: boolean;
        reason?: string;
        status?: string;
        endDate?: string | null;
      }>;

      const detail = customEvent.detail;
      if (!detail || detail.isActive !== false) {
        return;
      }

      setSession((prevSession) => {
        if (!prevSession?.tenant) {
          return prevSession;
        }

        return {
          ...prevSession,
          tenant: {
            ...prevSession.tenant,
            subscriptionData: {
              ...(prevSession.tenant.subscriptionData || {
                id: "",
                tenantId: prevSession.tenant.id,
                subscriptionPlanId: "",
                planName: prevSession.tenant.subscription?.planName || "",
                startDate: prevSession.tenant.subscription?.startDate || "",
                endDate: prevSession.tenant.subscription?.endDate || "",
                status: "EXPIRED",
              }),
              status: String(detail.status || "EXPIRED").toUpperCase(),
              endDate: detail.endDate ?? prevSession.tenant.subscriptionData?.endDate ?? prevSession.tenant.subscription?.endDate ?? null,
            },
          },
        };
      });
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener(SUBSCRIPTION_STATE_CHANGED_EVENT, handleSubscriptionStateChanged as EventListener);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener(SUBSCRIPTION_STATE_CHANGED_EVENT, handleSubscriptionStateChanged as EventListener);
    };
  }, [clearSession]);

  const updateUser = useCallback((agent: AuthAgent) => {
    setSession((prevSession) => {
      if (!prevSession) {
        return prevSession;
      }

      return {
        ...prevSession,
        agent,
      };
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.agent ?? null,
      tenant: session?.tenant ?? null,
      accessToken: session?.accessToken ?? null,
      isLoggedIn: Boolean(session?.accessToken && session?.agent),
      login,
      logout,
      updateUser,
      refreshSession,
    }),
    [session, login, logout, updateUser, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
