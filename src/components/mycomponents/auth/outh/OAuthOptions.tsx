import OAuthButton from "@/components/mycomponents/auth/outh/OAuthButton";
import type {OAuthAuthResponse} from "@/types/interface";
import {
  DiscordIcon,
  FacebookIcon,
  GithubIcon,
  GoogleIcon,
} from "@/components/icons";
import type { ReactNode } from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store/store";
import { routePaths } from "@/routes/routepaths/routePaths";
import type { OAuthProvider } from "@/types/types";

type Provider = OAuthProvider;

const providerConfig: Record<Provider, { provider: Provider; label: string; icon: ReactNode }> = {
  google: {
    provider: "google",
    label: "Continue with Google",
    icon: <GoogleIcon />,
  },
  github: {
    provider: "github",
    label: "Continue with GitHub",
    icon: <GithubIcon />,

  },
  facebook: {
    provider: "facebook",
    label: "Continue with Facebook",
    icon: <FacebookIcon />,

  },
  discord: {
    provider: "discord",
    label: "Continue with Discord",
    icon: <DiscordIcon />,

  },
};

const OAuthOptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleAuthenticated = (response: OAuthAuthResponse) => {
    dispatch(
      loginSuccess({
        token: response.token,
        user: {
          id: response.id,
          username: response.username,
          email: response.email,
          name: response.name,
          roles: response.roles,
        },
      })
    );
    setError("");
    navigate(routePaths.dashboardHome, { replace: true });
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* OAuth Providers */}
      <div className="flex w-full flex-wrap justify-center gap-x-5 gap-y-5">
        {Object.values(providerConfig).map((config) => (
          <OAuthButton
            key={config.provider}
            outhconfig={config}
            isLableVisible={false}
            onAuthenticated={handleAuthenticated}
            onError={setError}
          />
        ))}
      </div>
      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default OAuthOptions;