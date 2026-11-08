import authRoutes from "./authRoutes";
import type { RouteObject } from "react-router-dom";

const unprotectedRoutes: RouteObject[] = [...authRoutes];

export default unprotectedRoutes;
