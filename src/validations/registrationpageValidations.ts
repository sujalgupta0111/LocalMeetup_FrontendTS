
export interface RegistrationForm {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  pincode?: string;
}

export interface RegistrationErrors {
  [field: string]: string;
}

export interface PasswordStrength {
  score: number;
  label: "" | "Weak" | "Medium" | "Strong";
  color: string;
  textColor: string;
}

export const validateStep = (
  step: number,
  form: RegistrationForm
): RegistrationErrors => {
  const errors: RegistrationErrors = {};

  const required = (field: keyof RegistrationForm, message: string): void => {
    if (!form[field]?.trim()) {
      errors[field] = message;
    }
  };

  switch (step) {
    case 1:
      required("firstName", "First name is required");
      required("username", "Username is required");
      required("email", "Email is required");

      if (form.firstName && form.firstName.length > 100) {
        errors.firstName = "First name must not exceed 100 characters";
      }

      if (form.lastName && form.lastName.length > 100) {
        errors.lastName = "Last name must not exceed 100 characters";
      }

      if (
        form.username &&
        (form.username.length < 3 || form.username.length > 100)
      ) {
        errors.username = "Username must be between 3 and 100 characters";
      }

      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = "Invalid email format";
      }
      break;

    case 2:
      required("password", "Password is required");
      required("confirmPassword", "Please confirm your password");

      if (
        form.password &&
        (form.password.length < 8 || form.password.length > 100)
      ) {
        errors.password = "Password must be between 8 and 100 characters";
      }

      if (
        form.confirmPassword &&
        form.password !== form.confirmPassword
      ) {
        errors.confirmPassword = "Passwords do not match";
      }
      break;

    case 3:
      if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
        errors.pincode = "Pincode must be 6 digits";
      }
      break;

    default:
      break;
  }

  return errors;
};

export const calculatePasswordStrength = (
  pwd: string
): PasswordStrength => {
  if (!pwd) {
    return {
      score: 0,
      label: "",
      color: "bg-muted",
      textColor: "text-muted-foreground",
    };
  }

  let score = 0;

  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) {
    return {
      score,
      label: "Weak",
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
    };
  }

  if (score <= 4) {
    return {
      score,
      label: "Medium",
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    };
  }

  return {
    score,
    label: "Strong",
    color: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
  };
};
