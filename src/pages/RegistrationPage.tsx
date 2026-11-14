
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "@/api/auth";
import { Button } from "@/components/mycomponents/ui";
import { ThemeToggle } from "@/components/icons";
import { validateStep } from "@/validations";
import { validatePasswordInformation } from "@/validations/passwordValidator";
import * as ConstantText from "@/constants/pagecostants";
import AccountInfoStep from "@/components/mycomponents/auth/registration/AccountInfoStep";
import PasswordStep from "@/components/mycomponents/auth/registration/PasswordStep";
import AddressStep from "@/components/mycomponents/auth/registration/AddressStep";
import { routePaths } from "@/routes/routepaths/routePaths";

interface RegistrationForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  houseNo: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

type RegistrationField = keyof RegistrationForm;

type RegistrationErrors = Partial<Record<RegistrationField, string>>;

interface RegistrationStepProps {
  formDetails: RegistrationForm;
  updateField: (
    field: RegistrationField
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: RegistrationErrors;
  inputClass: string;
}

interface RegistrationStepConfig {
  id: number;
  heading: string;
  subheading: string;
  Component: React.ComponentType<RegistrationStepProps>;
}

interface RegistrationLocationState {
  email?: string;
  username?: string;
  flow?: "forgotPassword";
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const initialForm: RegistrationForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  houseNo: "",
  street: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
};

const formSteps: RegistrationStepConfig[] = [
  {
    id: 1,
    heading: ConstantText.RegistrationCreateYourAccountText,
    subheading: ConstantText.RegistrationStep1SubHeading,
    Component: AccountInfoStep,
  },
  {
    id: 2,
    heading: ConstantText.RegistrationSecureYourAccountText,
    subheading: ConstantText.RegistrationStep2SubHeading,
    Component: PasswordStep,
  },
  {
    id: 3,
    heading: ConstantText.RegistrationAddYourDetailsText,
    subheading: ConstantText.RegistrationStep3SubHeading,
    Component: AddressStep,
  },
];

const formDetailsSetup = (
  locationState: RegistrationLocationState | null
): RegistrationForm => {
  if (locationState?.flow === "forgotPassword") {
    return {
      ...initialForm,
      email: locationState.email ?? "",
    };
  }

  const savedForm = sessionStorage.getItem("formDetails");

  if (savedForm) {
    try {
      const parsedForm: unknown = JSON.parse(savedForm);

      if (
        parsedForm !== null &&
        typeof parsedForm === "object" &&
        !Array.isArray(parsedForm)
      ) {
        return { ...initialForm, ...parsedForm } as RegistrationForm;
      }
    } catch {
      sessionStorage.removeItem("formDetails");
    }
  }

  return {
    ...initialForm,
    email: locationState?.email ?? "",
    username: locationState?.username ?? "",
  };
};

const inputClass =
  "rounded-xl border-border bg-input/40 dark:bg-[#141720] text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20";

const RegistrationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as RegistrationLocationState | null;
  const isForgotPasswordFlow = locationState?.flow === "forgotPassword";
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [step, setStep] = useState<number>(
    () =>
      isForgotPasswordFlow
        ? 2
        : Number(sessionStorage.getItem("registrationStep")) || 1
  );

  const [formDetails, setFormDetails] = useState<RegistrationForm>(() =>
    formDetailsSetup(locationState)
  );

  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isForgotPasswordFlow) {
      sessionStorage.setItem("registrationStep", String(step));
    }

    headingRef.current?.focus();
  }, [isForgotPasswordFlow, step]);

  const updateField =
    (field: RegistrationField) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ): void => {
      setFormDetails((current) => ({
        ...current,
        [field]: event.target.value,
      }));

      setErrors((current) => ({
        ...current,
        [field]: "",
      }));

      setSubmitError("");
    };

  const handleNext = (event?: FormEvent | React.MouseEvent): void => {
    event?.preventDefault();
    event?.stopPropagation();

    const nextErrors = validateStep(step, formDetails) as RegistrationErrors;

    sessionStorage.setItem("formDetails", JSON.stringify(formDetails));
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0 && step < formSteps.length) {
      setStep((current) => current + 1);
    }
  };

  const handleBack = (): void => {
    setStep((current) => Math.max(1, current - 1));
    setErrors({});
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (isForgotPasswordFlow) {
      const passwordErrors = validateStep(2, formDetails) as RegistrationErrors;

      if (
        formDetails.password &&
        !validatePasswordInformation(formDetails.password).isValid
      ) {
        passwordErrors.password =
          "Password must include 8+ characters, uppercase, lowercase, a number, and a special character.";
      }

      setErrors(passwordErrors);
      setSubmitError("");

      if (Object.keys(passwordErrors).length === 0) {
        setSubmitError(
          "Password cannot be updated because the backend does not currently provide a password update API. No password was changed."
        );
      }

      return;
    }

    if (step < formSteps.length) {
      handleNext();
      return;
    }

    const stepErrors = formSteps.map((s) =>
      validateStep(s.id, formDetails)
    );

    const allErrors = Object.assign({}, ...stepErrors) as RegistrationErrors;

    setErrors(allErrors);
    setSubmitError("");

    if (Object.keys(allErrors).length > 0) {
      const firstInvalidStep = stepErrors.findIndex(
        (err) => Object.keys(err).length > 0
      );

      if (firstInvalidStep !== -1) {
        setStep(firstInvalidStep + 1);
      }

      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser(formDetails);

      sessionStorage.removeItem("formDetails");
      sessionStorage.removeItem("registrationStep");

      navigate(routePaths.root);
    } catch (error: unknown) {
      const apiError = error as ApiError;

      setSubmitError(
        apiError.response?.data?.message ??
          apiError.message ??
          "Unable to create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepConfig = formSteps[step - 1] ?? formSteps[0];
  const ActiveComponent = currentStepConfig.Component;

  const stepProps: RegistrationStepProps = {
    formDetails,
    updateField,
    errors,
    inputClass,
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-400/20 dark:bg-violet-600/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-112 w-md rounded-full bg-cyan-400/20 dark:bg-cyan-600/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-300/15 dark:bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [bg-size:40px_40px]" />
      </div>

      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <section className="w-full max-w-xl rounded-3xl border border-border/60 bg-card/90 p-6 shadow-2xl shadow-black/5 dark:shadow-black/40 backdrop-blur-xl sm:p-9">
          <div className="mb-7 flex items-center justify-between">
            <Link
              to={isForgotPasswordFlow ? routePaths.forgotPassword : routePaths.root}
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {isForgotPasswordFlow ? "Back to Forgot Password" : "Back to login"}
            </Link>

            {!isForgotPasswordFlow && (
              <span className="text-sm font-medium text-muted-foreground">
                Step {step} of {formSteps.length}
              </span>
            )}
          </div>

          <div className="mb-8">
            {!isForgotPasswordFlow && (
              <div className="mb-4 flex gap-2">
                {formSteps.map((s, index) => (
                  <div
                    key={s.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      index + 1 <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}

            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-3xl font-bold tracking-tight text-foreground"
            >
              {isForgotPasswordFlow
                ? "Reset your password"
                : currentStepConfig.heading}
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isForgotPasswordFlow
                ? `Choose a new password for ${formDetails.email}.`
                : currentStepConfig.subheading}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="motion-safe:animate-[account-step-in_220ms_ease-out]">
              <ActiveComponent {...stepProps} />
            </div>

            {submitError && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              >
                {submitError}
              </div>
            )}

            <div
              className={`flex gap-3 pt-2 ${
                isForgotPasswordFlow ? "justify-end" : "justify-between"
              }`}
            >
              {!isForgotPasswordFlow && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 1 || isSubmitting}
                  leftIcon={<ArrowLeft size={17} />}
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}

              {isForgotPasswordFlow ? (
                <Button type="submit">Update password</Button>
              ) : step < formSteps.length ? (
                <Button
                  type="button"
                  rightIcon={<ArrowRight size={17} />}
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={isSubmitting}
                  loadingText="Creating account..."
                  rightIcon={<Check size={17} />}
                >
                  Finish
                </Button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default RegistrationPage;
