import { Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegistrationPage from "@/pages/RegistrationPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import OAuthCallback from "@/routes/unprotected/OAuthCallback";
import type { RouteObject } from "react-router-dom";
import { routePaths } from "@/routes/routepaths/routePaths";

const authRoutes: RouteObject[] = [
  {
    path: routePaths.root,
    element: <LoginPage />,
  },
  {
    path: routePaths.login,
    element: <LoginPage />,
  },
  {
    path: routePaths.register,
    element: <RegistrationPage />,
  },
  {
    path: routePaths.forgotPassword,
    element: <ForgotPasswordPage />,
  },
  {
    path: routePaths.dashboardAlias,
    element: <Navigate to={routePaths.dashboard} replace />,
  },
  {
    path: routePaths.oauthCallback,
    element: <OAuthCallback />,
  }

];

export default authRoutes;
