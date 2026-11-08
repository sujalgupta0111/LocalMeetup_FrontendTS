import { userServiceApiClient } from "@/api/axios";
import type { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getApiMessage = (error: unknown, fallbackMessage: string): string => {
  const apiError = error as AxiosError<ApiErrorResponse | string>;
  const responseData = apiError.response?.data;

  const backendMessage =
    (typeof responseData === "string"
      ? responseData
      : responseData?.message || responseData?.error) ||
    apiError.message;

  return backendMessage || fallbackMessage;
};

const getOtpEndpoint = (  action: "GENERATE" | "VERIFY",  email: string
): string =>
  `/auth/otpVerify/${action}/${encodeURIComponent(email)}`;

export const sendForgotPasswordOtp = async (email: string): Promise<string> => {
  const response = await userServiceApiClient.post<string>(
    getOtpEndpoint("GENERATE", email)
  );

  return response.data;
};

export const verifyForgotPasswordOtp = async (
  email: string,
  otp: string
): Promise<string> => {
  const response = await userServiceApiClient.post<string>(
    getOtpEndpoint("VERIFY", email),
    undefined,
    { params: { otp } }
  );

  return response.data;
};

export const getForgotPasswordErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => getApiMessage(error, fallbackMessage);
