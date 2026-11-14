import { Button } from "@/components/mycomponents/ui";
import {
  handleAuth,
} from "@/api/oauth/oauthlogin";


import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import type { OAuthButtonProps } from "@/types/types";


const OAuthButton = ({
  outhconfig,
  isLableVisible = false,
  disabled = false,
  onAuthenticated,
  onError,
}: OAuthButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || outhconfig.disabled || loading) {
      return;
    }

    setLoading(true);

    try {
      const authResponse = await handleAuth(outhconfig.provider);
      onAuthenticated(authResponse);
    } catch (error: unknown) {
      onError(
        error instanceof Error ? error.message : "Sign-in could not be completed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-w-16 flex-col items-center gap-2">
      <Button
        type="button"
        variant="outline"
        iconOnly
        onClick={() => void handleClick()}
        disabled={disabled || outhconfig.disabled || loading}
        aria-busy={loading}
        aria-label={outhconfig.label}
        className="
          border-border
          bg-card/90
          text-foreground
          shadow-sm
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-accent
          hover:border-primary/40
          hover:shadow-md"
      >
        {loading ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          outhconfig.icon
        )}
      </Button>

      {isLableVisible && (
        <span className="w-full whitespace-nowrap text-center text-xs font-medium text-muted-foreground">
          {outhconfig.label}
        </span>
      )}
     
    </div>
  );
};

export default OAuthButton;