import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { registerAppLoadingController } from "../services/apiClient";

export interface AppLoadingState {
  isBlocking: boolean;
  message?: string;
}

interface AppLoadingContextValue extends AppLoadingState {
  setLoading: (isBlocking: boolean, message?: string) => void;
  beginBlocking: (message?: string) => boolean;
  endBlocking: () => void;
}

const AppLoadingContext = createContext<AppLoadingContextValue | undefined>(undefined);

type AppLoadingProviderProps = {
  children: ReactNode;
};

export const AppLoadingProvider = ({ children }: AppLoadingProviderProps) => {
  const [activeMutations, setActiveMutations] = useState(0);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const isBlockingRef = useRef(false);

  const setLoading = useCallback((isBlocking: boolean, nextMessage?: string) => {
    isBlockingRef.current = isBlocking;
    setActiveMutations(isBlocking ? 1 : 0);
    setMessage(isBlocking ? nextMessage || "Processing..." : undefined);
  }, []);

  const beginBlocking = useCallback((nextMessage?: string) => {
    if (isBlockingRef.current) {
      return false;
    }

    isBlockingRef.current = true;
    setActiveMutations(1);
    setMessage(nextMessage || "Processing...");
    return true;
  }, []);

  const endBlocking = useCallback(() => {
    isBlockingRef.current = false;
    setActiveMutations(0);
    setMessage(undefined);
  }, []);

  const isBlocking = activeMutations > 0;

  useEffect(() => {
    isBlockingRef.current = isBlocking;
  }, [isBlocking]);

  useEffect(() => {
    if (!isBlocking) {
      document.body.style.cursor = "";
      return;
    }

    document.body.style.cursor = "progress";

    return () => {
      document.body.style.cursor = "";
    };
  }, [isBlocking]);

  useEffect(() => {
    registerAppLoadingController({
      begin: beginBlocking,
      end: endBlocking,
      isBlocking: () => isBlockingRef.current,
    });

    return () => {
      registerAppLoadingController(null);
    };
  }, [beginBlocking, endBlocking]);

  const value = useMemo<AppLoadingContextValue>(
    () => ({
      isBlocking,
      message,
      setLoading,
      beginBlocking,
      endBlocking,
    }),
    [isBlocking, message, setLoading, beginBlocking, endBlocking],
  );

  return <AppLoadingContext.Provider value={value}>{children}</AppLoadingContext.Provider>;
};

export const useAppLoading = () => {
  const context = useContext(AppLoadingContext);

  if (!context) {
    throw new Error("useAppLoading must be used within an AppLoadingProvider");
  }

  return context;
};
