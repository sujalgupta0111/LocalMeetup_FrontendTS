import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  clearStoredJwt,
  getStoredJwt,
  validateStoredJwt,
} from "@/validations";
import { routePaths } from "@/routes/routepaths/routePaths";

const ProtectedRoute = () => {
  const location = useLocation();
  const result = validateStoredJwt();

  useEffect(() => {
    if (result.isValid) {
      return;
    }

    if (getStoredJwt()) {
      clearStoredJwt();
    }

    if (import.meta.env.DEV) {
      console.debug("[JWT] Redirecting to login");
    }
  }, [result.isValid, result.reason]);

  if (!result.isValid) {
    return (
      <Navigate
        to={routePaths.login}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;