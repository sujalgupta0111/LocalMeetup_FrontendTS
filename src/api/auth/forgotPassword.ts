import { userServiceApiClient } from "@/api/axios";
import type { AxiosError } from "axios";

const endpointConfig = {
  requestOtp:
    import.meta.env.VITE_FORGOT_PASSWORD_REQUEST_OTP_URL ||
    "/auth/forgot-password",
  resendOtp:
    import.meta.env.VITE_FORGOT_PASSWORD_RESEND_OTP_URL ||
    "/auth/resend-otp",
  verifyOtp:
    import.meta.env.VITE_FORGOT_PASSWORD_VERIFY_OTP_URL ||
    "/auth/verify-otp",
  resetPassword:
    import.meta.env.VITE_FORGOT_PASSWORD_RESET_URL ||
    "/auth/reset-password",
};

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface ForgotPasswordOtpPayload {
  email: string;
}

interface VerifyForgotPasswordOtpPayload {
  email: string;
  otp: string;
}

interface ResetForgotPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  resetToken?: string;
}

interface ResetPasswordApiPayload {
  email: string;
  otp: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  resetToken?: string;
}

const getApiMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  const apiError = error as AxiosError<ApiErrorResponse>;

  const backendMessage =
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    apiError.message;

  return backendMessage || fallbackMessage;
};

export const sendForgotPasswordOtp = async ({
  email,
}: ForgotPasswordOtpPayload) => {
  const response = await userServiceApiClient.post(
    endpointConfig.requestOtp,
    { email }
  );

  return response.data;
};

export const resendForgotPasswordOtp = async ({
  email,
}: ForgotPasswordOtpPayload) => {
  const response = await userServiceApiClient.post(
    endpointConfig.resendOtp,
    { email }
  );

  return response.data;
};

export const verifyForgotPasswordOtp = async ({
  email,
  otp,
}: VerifyForgotPasswordOtpPayload) => {
  const response = await userServiceApiClient.post(
    endpointConfig.verifyOtp,
    { email, otp }
  );

  return response.data;
};

export const resetForgotPassword = async ({
  email,
  otp,
  newPassword,
  confirmPassword,
  resetToken,
}: ResetForgotPasswordPayload) => {
  const payload: ResetPasswordApiPayload = {
    email,
    otp,
    password: newPassword,
    newPassword,
    confirmPassword,
  };

  if (resetToken) {
    payload.resetToken = resetToken;
  }

  const response = await userServiceApiClient.post(
    endpointConfig.resetPassword,
    payload
  );

  return response.data;
};

export const getForgotPasswordErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => getApiMessage(error, fallbackMessage);