import { useMemo } from "react";
import useAuth from "./useAuth";
import { getSubscriptionAccessState } from "../utils/subscriptionAccess";

const useSubscriptionAccess = () => {
  const { tenant } = useAuth();

  return useMemo(() => {
    return getSubscriptionAccessState(tenant);
  }, [tenant]);
};

export default useSubscriptionAccess;
