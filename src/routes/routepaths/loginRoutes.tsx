import type { RouteObject } from "react-router-dom";

import RegistrationPage from "@/pages/RegistrationPage";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import MainLayout from "@/components/layouts/MainLayout";
import { routePaths } from "@/routes/routepaths/routePaths";

const loginRoutes: RouteObject[] = [
  {
    path: routePaths.root,
    element: <LoginPage />,
  },
  {
    path: routePaths.login,
    element: <LoginPage />,
  },
  {
    path: routePaths.forgotPassword,
    element: <ForgotPasswordPage />,
  },
  {
    path: routePaths.dashboard,
    element: <MainLayout />,
  },
  {
    path: routePaths.register,
    element: <RegistrationPage />,
  },
];

export default loginRoutes;