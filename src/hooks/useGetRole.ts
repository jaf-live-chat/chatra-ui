import { USER_ROLES } from "../constants/constants";
import useAuth from "./useAuth";

const useGetRole = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === USER_ROLES.ADMIN.value;
  const isSupportAgent = user?.role === USER_ROLES.SUPPORT_AGENT.value;
  const isMasterAdmin = user?.role === USER_ROLES.MASTER_ADMIN.value;

  return {
    isAdmin,
    isSupportAgent,
    isMasterAdmin,
  };
};

export default useGetRole;
