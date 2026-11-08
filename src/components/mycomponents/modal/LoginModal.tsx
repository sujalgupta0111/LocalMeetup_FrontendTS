import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "@/components/icons";
import { loginPageStreamText, loginPageBrandLogoText, loginPageDescriptionText, EnterEmailOrUsernameText, EnterPasswordText, Passwordtext, ForgotPasswordText, LoginButtonText, OtherLoginOptionsText, orText, DontHaveAccountText, createAccountButtonText } from "@/constants/pagecostants";
import { Input, TextStreamer, Button, DividerLine } from "@/components/mycomponents/ui";
import { OAuthOptions } from "@/components/mycomponents/auth/outh";
import { emailValidator } from "@/validations";
import { loginUser } from "@/api/auth";
import { routePaths } from "@/routes/routepaths/routePaths";

type RedirectTarget = {
  pathname: string;
  search: string;
  hash: string;
};

const getRedirectTarget = (state: unknown): RedirectTarget | undefined => {
  if (typeof state !== "object" || state === null || !("from" in state)) {
    return undefined;
  }

  const from = state.from;

  if (
    typeof from !== "object" ||
    from === null ||
    !("pathname" in from) ||
    typeof from.pathname !== "string"
  ) {
    return undefined;
  }

  return {
    pathname: from.pathname,
    search:
      "search" in from && typeof from.search === "string" ? from.search : "",
    hash: "hash" in from && typeof from.hash === "string" ? from.hash : "",
  };
};

// Constants (Upper snake case is standard for constants outside components)
const TRANSITION_TIMING = 2000;
const REPEAT_DELAY = 2000;

const LoginModal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");



  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Reset previous messages
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    // Validations
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!emailValidator(trimmedEmail)) {
      setError("Please enter a valid email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // API Call
      await loginUser(trimmedEmail, password);

      setSuccess("Login successful!");
      navigate(
        getRedirectTarget(location.state) ?? routePaths.dashboard,
        { replace: true }
      );

    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="
        w-full max-w-md
        rounded-3xl
        border border-border/60
        bg-card/90
        p-6
        shadow-2xl shadow-black/5 dark:shadow-black/40
        backdrop-blur-xl
        sm:p-9
      "
    >
      {/* Brand Logo */}

      <BrandLogo loginPageBrandLogo={loginPageBrandLogoText} />

      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-[32px]">
          <TextStreamer
            text={loginPageStreamText}
            transitionTime={TRANSITION_TIMING}
            isRepeat={true}
            repeatDelay={REPEAT_DELAY}
          />
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">{loginPageDescriptionText}</p>
      </div>

      {/* Primary Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Input */}
        <Input
          label={EnterEmailOrUsernameText}
          name="identifier"
          type="text"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          placeholder={EnterEmailOrUsernameText}
          autoComplete="username"
          disabled={loading}
          className="
            w-full rounded-xl
            border-border
            bg-input/50 dark:bg-[#141720]
            text-foreground
            placeholder:text-muted-foreground
            transition-all duration-200
            focus:border-primary
            focus:bg-background
            focus:text-foreground
            focus:ring-2
            focus:ring-primary/20
          "
        />

        {/* Password Input */}
        <div>
          <Input
            label={Passwordtext}
            name="password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError("");
            }}
            placeholder={EnterPasswordText}
            isPassword
            autoComplete="current-password"
            disabled={loading}
            className="
              w-full rounded-xl
              border-border
              bg-input/50 dark:bg-[#141720]
              text-foreground
              placeholder:text-muted-foreground
              transition-all duration-200
              focus:border-primary
              focus:bg-background
              focus:text-foreground
              focus:ring-2
              focus:ring-primary/20
            "
          />

          {/* Forgot Password Link */}
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={() => navigate(routePaths.forgotPassword)}
              className="
                h-auto min-h-0
                p-0
                text-xs font-semibold
                text-primary
                hover:bg-transparent
                hover:text-primary/80
              "
            >
              {ForgotPasswordText}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="
              flex items-center gap-3
              rounded-xl
              border border-destructive/20
              bg-destructive/10
              px-4 py-3
              text-sm font-medium text-destructive
            "
          >
            <span
              className="
                flex h-6 w-6 shrink-0
                items-center justify-center
                rounded-full
                bg-destructive/20
                text-xs font-bold
              "
              aria-hidden="true"
            >
              !
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div
            role="status"
            aria-live="polite"
            className="
              flex items-center gap-3
              rounded-xl
              border border-emerald-500/20
              bg-emerald-500/10
              px-4 py-3
              text-sm font-medium text-emerald-600 dark:text-emerald-400
            "
          >
            <span
              className="
                flex h-6 w-6 shrink-0
                items-center justify-center
                rounded-full
                bg-emerald-500/20
                text-xs font-bold
              "
              aria-hidden="true"
            >
              ✓
            </span>
            <span>{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          loading={loading}
          loadingText="Signing in..."
          className="
            group relative
            w-full overflow-hidden
            rounded-xl
            bg-gradient-to-r
            from-violet-600
            via-indigo-600
            to-indigo-600
            py-3
            font-semibold text-white
            shadow-lg shadow-violet-500/25
            transition-all duration-200
            hover:-translate-y-0.5
            hover:shadow-xl
            hover:shadow-violet-500/30
            active:translate-y-0
            disabled:cursor-not-allowed
            disabled:opacity-70
          "
        >
          {LoginButtonText}
          {/* Button Shine Animation */}
          {!loading && (
            <span
              className="
                absolute inset-y-0 -left-full
                w-1/2
                rotate-12
                bg-white/20
                transition-all duration-700
                group-hover:left-full
              "
              aria-hidden="true"
            />
          )}
        </Button>
      </form>

      {/* OAuth Section */}


      {/* Divider - Top */}
      <DividerLine text={OtherLoginOptionsText} />

      {/* OAuth Options */}
      <OAuthOptions />


      {/* Divider - Bottom */}
      <DividerLine text={orText} />

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground">
        {DontHaveAccountText}{" "}
        <Link
          to={routePaths.register}
          state={{
            email: email.trim(),
            username: email.trim(),
          }}
          className="
            font-semibold text-primary
            transition-colors duration-200
            hover:text-primary/80
          "
        >
          {createAccountButtonText}
        </Link>
      </p>
    </section>
  );
};

export default LoginModal;