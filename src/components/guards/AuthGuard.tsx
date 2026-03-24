import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { USER_ROLES } from "../../constants/constants";
import useAuth from "../../hooks/useAuth";

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

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role || !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
