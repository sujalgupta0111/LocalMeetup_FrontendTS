import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { BrandLogo, ThemeToggle } from "@/components/icons";
import { AnimatedBorder, Button, Input } from "@/components/mycomponents/ui";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui";
import {
  getForgotPasswordErrorMessage,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "@/api/auth";
import ChangePassword from "../auth/ForgotPassword/ChangePassword";
import { emailValidator } from "@/validations";
import { loginPageBrandLogoText } from "@/constants/pagecostants";
import { notification } from "@/utils/notificationUtils";

const OTP_DURATION_SECONDS = 600;

const formatCountdown = (secondsLeft: number) => {
  const totalSeconds = Math.max(0, secondsLeft);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const isOtpVerificationFailure = (message: string) =>
  /\b(invalid|incorrect|wrong|expired|failed|failure|unsuccessful|unverified|mismatch|denied)\b|not\s+(?:verified|valid|found)|could\s+not|unable\s+to/i.test(
    message
  );

type ForgotPasswordProps = {isModal?: boolean;};

const ForgotPassword = ({ isModal = false }: ForgotPasswordProps) => {
  const [currentStep, setCurrentStep] = useState<"email" | "otp" | "password">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION_SECONDS);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

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

  const resetTimer = () => setTimeLeft(OTP_DURATION_SECONDS);

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
    setIsSendingOtp(true);

    try {
      const responseMessage = await sendForgotPasswordOtp(trimmedEmail);
      setEmail(trimmedEmail);
      setCurrentStep("otp");
      setOtp("");
      resetTimer();
      notification.success(responseMessage || "A verification code has been sent.");
    } catch (requestError) {
      notification.error(
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

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setError("");
    setIsVerifyingOtp(true);

    try {
      const responseMessage = await verifyForgotPasswordOtp(
        email.trim(),
        trimmedOtp
      );

      if (isOtpVerificationFailure(responseMessage)) {
        notification.error(responseMessage || "Invalid OTP. Please try again.");
        return;
      }

      setCurrentStep("password");
      setOtp("");
      setError("");
    } catch (verifyError) {
      const message = getForgotPasswordErrorMessage(
        verifyError,
        "Invalid OTP. Please try again."
      );
      notification.error(
        /\bexpired\b/i.test(message)
          ? "OTP has expired. Please request a new OTP."
          : message
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) {
      return;
    }

    setError("");
    setIsResendingOtp(true);

    try {
      const responseMessage = await sendForgotPasswordOtp(email.trim());
      setOtp("");
      resetTimer();
      notification.success(responseMessage || "A new verification code has been sent.");
    } catch (resendError) {
      notification.error(
        getForgotPasswordErrorMessage(
          resendError,
          "Something went wrong. Please try again."
        )
      );
    } finally {
      setIsResendingOtp(false);
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
        className="w-full rounded-xl bg-linear-to-r from-violet-600 via-indigo-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Send OTP
      </Button>
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
        className="w-full rounded-xl bg-linear-to-r from-violet-600 via-indigo-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Verify OTP
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {timeLeft === 0 ? (
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
    </div>
  );

  const recoveryForm = (
    <section
      className={
        isModal
          ? "w-full p-6 sm:p-9"
          : "w-full rounded-3xl border border-border/60 bg-card/90 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl dark:shadow-black/40 sm:p-9"
      }
    >
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
              : "Change Password"}
        </h1>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {currentStep === "email" && renderEmailStep()}
      {currentStep === "otp" && renderOtpStep()}
      {currentStep === "password" && <ChangePassword email={email.trim()} />}
    </section>
  );

  if (isModal) {
    return recoveryForm;
  }

  return (
    <>
    
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6">
      <AnimatedBorder color="purple" borderRadius="rounded-3xl">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/15" />
        <div className="absolute -bottom-40 -right-32 h-112 w-md rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-600/15" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-300/15 blur-3xl dark:bg-fuchsia-600/10" />
        <div className="absolute inset-0 opacity-[0.03] [bg[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [bg-size:40px_40px] dark:opacity-[0.04]" />
      </div>

      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">
          
            {recoveryForm}
         
        </div>
      </div>
       </AnimatedBorder>
    </main>
    </>
  );
};

export default ForgotPassword;
