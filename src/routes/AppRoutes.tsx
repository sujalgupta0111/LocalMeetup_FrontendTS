import { Navigate, useRoutes, type RouteObject } from "react-router-dom";
import protectedRoutes from "./protected";
import unprotectedRoutes from "./unprotected";
import { routePaths } from "./routepaths/routePaths";

const routes: RouteObject[] = [
  ...unprotectedRoutes,
  ...protectedRoutes,
  {
    path: "*",
    element: <Navigate to={routePaths.login} replace />,
  },
];

export default function AppRoutes() {
  return useRoutes(routes);
}