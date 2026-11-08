import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateUser, getForgotPasswordErrorMessage } from "@/api/auth";
import { Button, Input } from "@/components/mycomponents/ui";
import PasswordStrength from "@/components/mycomponents/auth/registration/PasswordStrength";
import {
  passwordMatcher,
  validatePasswordInformation,
} from "@/validations/passwordValidator";
import { Link, useNavigate } from "react-router-dom";
import { routePaths } from "@/routes/routepaths/routePaths";

type ChangePasswordProps = {
  email: string;
};

const ChangePassword = ({ email }: ChangePasswordProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(routePaths.login, { replace: true });
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, successMessage]);

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validatePasswordInformation(password).isValid) {
      setError("Password must meet all the requirements below.");
      return;
    }

    if (!passwordMatcher(password, confirmPassword)) {
      setError("Passwords do not match.");
      return;
    }

    setIsUpdating(true);

    try {
      await updateUser({
               firstName: "",
               lastName: "",
               username: "",
  email: email,
  password: password,
  phone: null,
  houseNo: null,
  street: null,
  city: null,
  state: null,
  country: null,
  pincode: null
}, "UPDATE");
      setSuccessMessage("Password updated successfully. You can now log in.");
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(
        getForgotPasswordErrorMessage(
          requestError,
          "Unable to update your password. Please try again."
        )
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleUpdatePassword} className="space-y-5" noValidate>
      <p className="text-center text-sm text-muted-foreground">
        Set a new password for{" "}
        <span className="font-semibold text-foreground">{email}</span>
      </p>

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

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div>
        <Input
          label="New password"
          name="new-password"
          isPassword
          autoComplete="new-password"
          value={password}
          disabled={isUpdating}
          onChange={(event) => {
            setPassword(event.target.value);
            if (error || successMessage) {
              setError("");
              setSuccessMessage("");
            }
          }}
        />
        <PasswordStrength password={password} confirmPassword={confirmPassword} />
      </div>

      <Input
        label="Confirm new password"
        name="confirm-password"
        isPassword
        autoComplete="new-password"
        value={confirmPassword}
        disabled={isUpdating}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          if (error || successMessage) {
            setError("");
            setSuccessMessage("");
          }
        }}
      />

      <Button
        type="submit"
        loading={isUpdating}
        loadingText="Updating..."
        disabled={isUpdating}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 active:translate-y-0"
      >
        Update Password
      </Button>

      <div className="text-center text-sm font-medium text-muted-foreground">
        <Link
          to={routePaths.login}
          className="text-primary transition-colors hover:text-primary/80"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ChangePassword;
