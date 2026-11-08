import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { BrandLogo, ThemeToggle } from "@/components/icons";
import PasswordStrength from "@/components/mycomponents/auth/registration/PasswordStrength";
import { AnimatedBorder, Button, Input } from "@/components/mycomponents/ui";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui";
import {
  getForgotPasswordErrorMessage,
  resendForgotPasswordOtp,
  resetForgotPassword,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "@/api/auth";
import { emailValidator, validatePasswordInformation } from "@/validations";
import { loginPageBrandLogoText } from "@/constants/pagecostants";
import { routePaths } from "@/routes/routepaths/routePaths";

const OTP_DURATION_SECONDS = 120;

const formatCountdown = (secondsLeft: number) => {
  const totalSeconds = Math.max(0, secondsLeft);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const getPasswordPolicyMessage = (password: string) => {
  if (!password) {
    return "";
  }

  const { isValid } = validatePasswordInformation(password);

  if (!isValid) {
    return "Password must include 8+ characters, uppercase, lowercase, a number, and a special character.";
  }

  return "";
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef<number | null>(null);

  const [currentStep, setCurrentStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION_SECONDS);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  useEffect(() => {
    if (currentStep !== "otp") {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((previousValue) => {
        if (previousValue <= 1) {
          clearInterval(intervalId);
          return 0;
        }

        return previousValue - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const resetTimer = () => setTimeLeft(OTP_DURATION_SECONDS);

  const isOtpExpired = timeLeft === 0;
  const passwordError = getPasswordPolicyMessage(newPassword);
  const confirmPasswordError =
    confirmPassword && newPassword !== confirmPassword
      ? "Passwords do not match."
      : "";
  const isResetFormValid =
    newPassword.trim() &&
    confirmPassword.trim() &&
    !passwordError &&
    !confirmPasswordError;

  const clearTransientState = () => {
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setVerificationToken("");
    setError("");
    setSuccessMessage("");
  };

  const handleSendOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailValidator(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSendingOtp(true);

    try {
      await sendForgotPasswordOtp({ email: trimmedEmail });
      setCurrentStep("otp");
      setOtp("");
      setTimeLeft(OTP_DURATION_SECONDS);
      setSuccessMessage(`We sent a verification code to ${trimmedEmail}.`);
    } catch (requestError) {
      setError(
        getForgotPasswordErrorMessage(
          requestError,
          "Something went wrong. Please try again."
        )
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedOtp = otp.trim();

    if (trimmedOtp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setError("");
    setIsVerifyingOtp(true);

    try {
      const response = await verifyForgotPasswordOtp({
        email: email.trim(),
        otp: trimmedOtp,
      });

      const nextToken = response?.token || response?.resetToken || "";
      setVerificationToken(nextToken);
      setCurrentStep("reset");
      setSuccessMessage("OTP verified successfully.");
    } catch (verifyError) {
      const message = getForgotPasswordErrorMessage(
        verifyError,
        "Invalid OTP. Please try again."
      );

      setError(
        message.toLowerCase().includes("expired")
          ? "OTP has expired. Please request a new OTP."
          : "Invalid OTP. Please try again."
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!isOtpExpired) {
      return;
    }

    setError("");
    setIsResendingOtp(true);

    try {
      await resendForgotPasswordOtp({ email: email.trim() });
      setOtp("");
      resetTimer();
      setSuccessMessage("A new verification code has been sent.");
    } catch (resendError) {
      setError(
        getForgotPasswordErrorMessage(
          resendError,
          "Something went wrong. Please try again."
        )
      );
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!trimmedOtp) {
      setError("OTP verification is required before resetting your password.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your new password.");
      return;
    }

    if (confirmPasswordError) {
      setError(confirmPasswordError);
      return;
    }

    setError("");
    setIsResettingPassword(true);

    try {
      await resetForgotPassword({
        email: trimmedEmail,
        otp: trimmedOtp,
        newPassword,
        confirmPassword,
        resetToken: verificationToken,
      });

      setCurrentStep("success");
      setSuccessMessage("Password Reset Successful");
      setError("");

      redirectTimeoutRef.current = window.setTimeout(() => {
        clearTransientState();
        setOtp("");
        setVerificationToken("");
        navigate(routePaths.login, { replace: true });
      }, 1800);
    } catch (resetError) {
      setError(
        getForgotPasswordErrorMessage(
          resetError,
          "Something went wrong. Please try again."
        )
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOtpSubmit} className="space-y-5" noValidate>
      <div>
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          placeholder="Enter your email"
          autoComplete="email"
          disabled={isSendingOtp}
          className="w-full rounded-xl border-border bg-input/40 dark:bg-[#141720] text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <Button
        type="submit"
        loading={isSendingOtp}
        loadingText="Sending..."
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Send OTP
      </Button>

      <div className="text-center text-sm font-medium text-muted-foreground">
        <Link to={routePaths.login} className="text-primary hover:text-primary/80 transition-colors">
          Back to Login
        </Link>
      </div>
    </form>
  );

  const renderOtpStep = () => (
    <div className="space-y-5">
      <div className="text-center text-sm text-muted-foreground">
        <p>
          We sent a verification code to:
          <span className="mt-1 block font-semibold text-foreground">{email}</span>
        </p>
      </div>

      <div className="space-y-3 text-center">
        <label className="block text-sm font-medium text-foreground">OTP</label>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => {
            setOtp(value);
            if (error) setError("");
          }}
          disabled={isVerifyingOtp}
          className="justify-center"
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-12 w-11 rounded-xl border border-border bg-input/40 dark:bg-[#141720] text-lg font-semibold text-foreground shadow-sm data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        type="button"
        onClick={handleVerifyOtp}
        loading={isVerifyingOtp}
        loadingText="Verifying..."
        disabled={otp.length !== 6 || isVerifyingOtp}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Verify OTP
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {isOtpExpired ? (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResendingOtp}
            className="font-semibold text-primary hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {isResendingOtp ? "Resending..." : "Resend OTP"}
          </button>
        ) : (
          <span>{`Resend OTP in ${formatCountdown(timeLeft)}`}</span>
        )}
      </div>

      <div className="text-center text-sm font-medium text-muted-foreground">
        <Link to={routePaths.login} className="text-primary hover:text-primary/80 transition-colors">
          Back to Login
        </Link>
      </div>
    </div>
  );

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
      <div>
        <Input
          label="New Password"
          isPassword
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            if (error) setError("");
          }}
          placeholder="Enter new password"
          autoComplete="new-password"
          disabled={isResettingPassword}
          error={passwordError}
          className="w-full rounded-xl border-border bg-input/40 dark:bg-[#141720] text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />

        {newPassword && <PasswordStrength password={newPassword} confirmPassword={confirmPassword} />}
      </div>

      <div>
        <Input
          label="Confirm Password"
          isPassword
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            if (error) setError("");
          }}
          placeholder="Confirm new password"
          autoComplete="new-password"
          disabled={isResettingPassword}
          error={confirmPasswordError}
          className="w-full rounded-xl border-border bg-input/40 dark:bg-[#141720] text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <Button
        type="submit"
        loading={isResettingPassword}
        loadingText="Resetting..."
        disabled={!isResetFormValid || isResettingPassword}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Reset Password
      </Button>

      <div className="text-center text-sm font-medium text-muted-foreground">
        <Link to={routePaths.login} className="text-primary hover:text-primary/80 transition-colors">
          Back to Login
        </Link>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 size={36} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">Password Reset Successful</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your password has been updated successfully.
        </p>
      </div>
      <Button
        type="button"
        onClick={() => {
          clearTransientState();
          navigate(routePaths.login, { replace: true });
        }}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 active:translate-y-0"
      >
        Back to Login
      </Button>
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-400/20 dark:bg-violet-600/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-400/20 dark:bg-cyan-600/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-300/15 dark:bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">
          <AnimatedBorder color="purple" borderRadius="rounded-3xl">
            <section className="w-full rounded-3xl border border-border/60 bg-card/90 p-6 shadow-2xl shadow-black/5 dark:shadow-black/40 backdrop-blur-xl sm:p-9">
              <BrandLogo loginPageBrandLogo={loginPageBrandLogoText} />

              <div className="mb-8 text-center">
                <div className="mb-3 flex justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {currentStep === "email"
                    ? "Forgot Password"
                    : currentStep === "otp"
                      ? "Verify OTP"
                      : currentStep === "reset"
                        ? "Reset Password"
                        : "Password Reset Successful"}
                </h1>
              </div>

              {(error || successMessage) && (
                <div className="mb-5 space-y-3">
                  {error && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMessage && !error && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {currentStep === "email" && renderEmailStep()}
              {currentStep === "otp" && renderOtpStep()}
              {currentStep === "reset" && renderResetStep()}
              {currentStep === "success" && renderSuccessStep()}
            </section>
          </AnimatedBorder>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
