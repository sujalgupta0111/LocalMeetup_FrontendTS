import { Navigate } from "react-router-dom";
import { routePaths } from "@/routes/routepaths/routePaths";

const OAuthCallback = () => {
  return <Navigate to={routePaths.login} replace />;
};

export default OAuthCallback;