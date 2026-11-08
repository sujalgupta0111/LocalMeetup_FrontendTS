import type { RouteObject } from "react-router-dom";
import dashboardRoutes from "../routepaths/dashboardRoutes";

const protectedRoutes: RouteObject[] = [...dashboardRoutes];

export default protectedRoutes;