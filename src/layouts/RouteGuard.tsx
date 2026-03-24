import { Navigate, Outlet } from "react-router";
import useAuth from "../hooks/useAuth";

type RouteGuardProps = {
  redirectTo?: string;
};

const RouteGuard = ({ redirectTo = "/login" }: RouteGuardProps) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
