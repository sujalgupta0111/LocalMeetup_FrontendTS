
const TOKEN_STORAGE_KEY = "token";

export interface JwtPayload {
  exp?: number | string;
  [key: string]: unknown;
}

export type JwtValidationReason =
  | "missing-token"
  | "invalid-token-type"
  | "malformed-token"
  | "invalid-payload"
  | "missing-expiration"
  | "invalid-expiration"
  | "expired-token"
  | "valid-token";

export interface JwtValidationResult {
  isValid: boolean;
  reason: JwtValidationReason;
  payload: JwtPayload | null;
}

const debugJwt = (message: string): void => {
  if (import.meta.env.DEV) {
    console.debug(`[JWT] ${message}`);
  }
};

/**
 * Get JWT from localStorage.
 */
export const getStoredJwt = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
};

/**
 * Remove JWT.
 */
export const clearStoredJwt = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

/**
 * Decode Base64URL.
 */
const decodeBase64Url = (value: string): string | null => {
  if (typeof atob !== "function") {
    return null;
  }

  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = normalized.padEnd(
    Math.ceil(normalized.length / 4) * 4,
    "="
  );

  return atob(padded);
};

/**
 * Decode JWT payload.
 */
export const decodeJwtPayload = (
  token: string
): JwtPayload | null => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3 || parts.some((part) => !part)) {
    return null;
  }

  try {
    const payloadString = decodeBase64Url(parts[1]);

    if (payloadString === null) {
      return null;
    }

    const parsedPayload: unknown = JSON.parse(payloadString);

    if (
      parsedPayload !== null &&
      typeof parsedPayload === "object" &&
      !Array.isArray(parsedPayload)
    ) {
      return parsedPayload as JwtPayload;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Validate JWT on frontend.
 *
 * Checks:
 * 1. Token exists.
 * 2. JWT has three parts.
 * 3. Payload can be decoded.
 * 4. exp exists.
 * 5. Token is not expired.
 */
export const validateJwt = (
  token: string | null | undefined
): JwtValidationResult => {
  if (!token) {
    return {
      isValid: false,
      reason: "missing-token",
      payload: null,
    };
  }

  debugJwt("JWT found");

  if (typeof token !== "string") {
    return {
      isValid: false,
      reason: "invalid-token-type",
      payload: null,
    };
  }

  const parts = token.split(".");

  if (parts.length !== 3 || parts.some((part) => !part)) {
    debugJwt("JWT malformed");

    return {
      isValid: false,
      reason: "malformed-token",
      payload: null,
    };
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    debugJwt("JWT malformed");

    return {
      isValid: false,
      reason: "invalid-payload",
      payload: null,
    };
  }

  debugJwt("JWT payload decoded");

  if (
    payload.exp === undefined ||
    payload.exp === null ||
    payload.exp === ""
  ) {
    return {
      isValid: false,
      reason: "missing-expiration",
      payload,
    };
  }

  const expirationTime = Number(payload.exp) * 1000;

  debugJwt("JWT expiration checked");

  if (!Number.isFinite(expirationTime)) {
    return {
      isValid: false,
      reason: "invalid-expiration",
      payload,
    };
  }

  if (expirationTime <= Date.now()) {
    debugJwt("JWT expired");

    return {
      isValid: false,
      reason: "expired-token",
      payload,
    };
  }

  return {
    isValid: true,
    reason: "valid-token",
    payload,
  };
};

/**
 * Validate token stored in localStorage.
 */
export const validateStoredJwt = (): JwtValidationResult => {
  const token = getStoredJwt();

  return validateJwt(token);
};
