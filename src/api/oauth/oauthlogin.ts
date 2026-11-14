import { userServiceApiClient } from "@/api/axios";
import { validateJwt } from "@/validations";
import type { OAuthAuthResponse } from "@/types/interface";
import type { OAuthPopupMessage } from "@/types/types";
import type { OAuthProvider } from "@/types/types";





const POPUP_TIMEOUT_MS = 5 * 60 * 1000;

const isOAuthProvider = (value: unknown): value is OAuthProvider => value === "google" ||value === "github" ||  value === "facebook" ||
  value === "discord";

const isOAuthPopupMessage = (value: unknown): value is OAuthPopupMessage => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const message = value as Record<string, unknown>;

  if (message.type !== "oauth:result") {
    return false;
  }

  const allowedFields = message.status === "success" ? ["type", "status", "provider", "code", "message"]: ["type", "status", "provider", "message"];

  if (Object.keys(message).some((field) => !allowedFields.includes(field))) {
    return false;
  }

  if (message.provider !== undefined && typeof message.provider !== "string") {
    return false;
  }

  if (
    message.message !== undefined &&
    typeof message.message !== "string"
  ) {
    return false;
  }

  if (message.status === "success") {
    return (
      isOAuthProvider(message.provider) &&
      typeof message.code === "string" &&
      message.code.length > 0
    );
  }

  return ( message.status === "error" &&  (message.provider === undefined || message.provider === "unknown" || isOAuthProvider(message.provider)));
};

const parseOAuthResponse = (value: unknown): OAuthAuthResponse => {
  if (typeof value !== "object" || value === null) {
    throw new Error("The authentication server returned an invalid response.");
  }

  const response = value as Record<string, unknown>;
  const data = response.data;

  if (
    response.success !== true ||
    typeof data !== "object" ||
    data === null ||
    typeof (data as Record<string, unknown>).token !== "string"
  ) {
    throw new Error("The authentication server returned an invalid response.");
  }

  const authData = data as Record<string, unknown>;
  const optionalStringFields = ["id", "tokenType", "name", "username", "email"];

  if (
    optionalStringFields.some(
      (field) =>
        authData[field] !== undefined &&
        authData[field] !== null &&
        typeof authData[field] !== "string"
    ) ||
    (authData.roles !== undefined &&
      authData.roles !== null &&
      (!Array.isArray(authData.roles) ||
        !authData.roles.every((role) => typeof role === "string")))
  ) {
    throw new Error("The authentication server returned an invalid response.");
  }

  return {
    id: typeof authData.id === "string" ? authData.id : undefined,
    token: authData.token as string,
    tokenType: typeof authData.tokenType === "string" ? authData.tokenType : undefined,
    name: typeof authData.name === "string" ? authData.name : undefined,
    username: typeof authData.username === "string" ? authData.username : undefined,
    email: typeof authData.email === "string" ? authData.email : undefined,
    roles: Array.isArray(authData.roles) ? authData.roles as string[] : undefined,
  };
};

const getApiBaseUrl = (): URL => {
  const baseUrl = userServiceApiClient.defaults.baseURL;

  if (!baseUrl) {
    throw new Error("The authentication server URL is not configured.");
  }

  try {
    return new URL(baseUrl, window.location.origin);
  } catch {
    throw new Error("The authentication server URL is invalid.");
  }
};

const exchangeCode = async (
  code: string,
  provider: OAuthProvider
): Promise<OAuthAuthResponse> => {
  const response = await userServiceApiClient.post<unknown>(
    "/auth/oauth/exchange",
    { code, provider },
    { timeout: 15_000 }
  );
  const authResponse = parseOAuthResponse(response.data);

  if (!validateJwt(authResponse.token).isValid) {
    throw new Error("The authentication server returned an invalid token.");
  }

  window.localStorage.setItem("token", authResponse.token);
  return authResponse;
};

export const handleAuth = (provider: OAuthProvider): Promise<OAuthAuthResponse> => {
  const apiBaseUrl = getApiBaseUrl();
  const servicePath = apiBaseUrl.pathname.replace(/\/+$/, "");
  const authorizationUrl = new URL(
    `${servicePath}/oauth2/authorization/${provider}`,
    apiBaseUrl.origin
  );
  const popup = window.open(
    authorizationUrl.toString(),
    "_blank",
    "popup,width=500,height=650,resizable=yes,scrollbars=yes"
  );

  if (!popup) {
    return Promise.reject(
      new Error("Your browser blocked the sign-in popup. Allow popups and try again.")
    );
  }

  return new Promise<OAuthAuthResponse>((resolve, reject) => {
    let settled = false;
    let messageProcessed = false;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(closeCheck);
      window.clearTimeout(timeout);
    };

    const finish = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      callback();
    };

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== apiBaseUrl.origin ||
        event.source !== popup ||
        messageProcessed ||
        !isOAuthPopupMessage(event.data)
      ) {
        return;
      }

      const message = event.data;

      if (message.status === "success" && message.provider !== provider) {
        return;
      }

      messageProcessed = true;

      if (message.status === "error") {
        finish(() => {
          popup.close();
          reject(new Error(message.message || "Sign-in was cancelled or failed."));
        });
        return;
      }

      void exchangeCode(message.code, provider)
        .then((authResponse) =>
          finish(() => {
            popup.close();
            resolve(authResponse);
          })
        )
        .catch((error: unknown) =>
          finish(() => {
            popup.close();
            reject(
              error instanceof Error
                ? error
                : new Error("Sign-in could not be completed.")
            );
          })
        );
    };

    window.addEventListener("message", handleMessage);

    const closeCheck = window.setInterval(() => {
      if (popup.closed && !messageProcessed) {
        finish(() => reject(new Error("The sign-in popup was closed.")));
      }
    }, 500);

    const timeout = window.setTimeout(() => {
      finish(() => {
        popup.close();
        reject(new Error("Sign-in timed out. Please try again."));
      });
    }, POPUP_TIMEOUT_MS);
  });
};