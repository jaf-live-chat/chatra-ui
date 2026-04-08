import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { USER_ROLES } from "../../constants/constants";
import useAuth from "../../hooks/useAuth";
import useGetRole from "../../hooks/useGetRole";

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]["value"];

type AdminGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  redirectTo?: string;
};

const AuthGuard = ({
  allowedRoles,
  children,
  redirectTo = "/portal/dashboard",
}: AdminGuardProps) => {
  const { isLoggedIn, user } = useAuth();
  const { isAdmin, isSupportAgent, isMasterAdmin } = useGetRole();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const hasAllowedRole = allowedRoles.some((role) => {
    if (role === USER_ROLES.MASTER_ADMIN.value) return isMasterAdmin;
    if (role === USER_ROLES.ADMIN.value) return isAdmin;
    if (role === USER_ROLES.SUPPORT_AGENT.value) return isSupportAgent;
    return user?.role === role;
  });

  if (!hasAllowedRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
