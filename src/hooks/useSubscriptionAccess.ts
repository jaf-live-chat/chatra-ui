import { useMemo } from "react";
import useAuth from "./useAuth";
import { getSubscriptionAccessState } from "../utils/subscriptionAccess";
import type { AuthTenant } from "../models/AgentModel";

const useSubscriptionAccess = (tenantOverride?: AuthTenant | null) => {
  const { tenant } = useAuth();
  const resolvedTenant = tenantOverride ?? tenant;

  return useMemo(() => {
    return getSubscriptionAccessState(resolvedTenant);
  }, [resolvedTenant]);
};

export default useSubscriptionAccess;
