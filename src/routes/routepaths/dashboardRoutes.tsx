import { Navigate, type RouteObject } from "react-router-dom";

import MainLayout from "@/components/layouts/MainLayout";
import ProtectedRoute from "../protected/ProtectedRoute";
import ComingSoon from "../protected/ComingSoon";
import HomePage from "@/pages/HomePage";
import { dashboardRouteSegments, routePaths } from "@/routes/routepaths/routePaths";

const dashboardRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: dashboardRouteSegments.home,
            element: <HomePage />,
          },
          {
            path: dashboardRouteSegments.vartalap,
            element: <ComingSoon title="Vartalap" description="Conversations coming soon." />,
          },
          {
            path: dashboardRouteSegments.viber,
            element: <ComingSoon title="Viber" description="Live vibes coming soon." />,
          },
          {
            path: dashboardRouteSegments.shop,
            element: <ComingSoon title="Shop" description="Marketplace coming soon." />,
          },
          {
            path: dashboardRouteSegments.posts,
            element: <ComingSoon title="Posts" description="Community posts coming soon." />,
          },
          {
            path: dashboardRouteSegments.settings,
            element: <ComingSoon title="Settings" description="Account settings coming soon." />,
          },
          {
            path: dashboardRouteSegments.profile,
            element: <Navigate to={routePaths.dashboard} replace />,
          },
        ],
      },
    ],
  },
];

export default dashboardRoutes;