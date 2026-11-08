
interface PasswordChecks {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialChar: boolean;
}

interface PasswordStrengthDetails {
  score: number;
  label: "Weak" | "Medium" | "Strong";
  color: string;
  textColor: string;
}

interface PasswordValidationResult {
  checks: PasswordChecks;
  score: number;
  strengthDetails: PasswordStrengthDetails;
  isValid: boolean;
}

export const validatePasswordInformation = (
  password: string
): PasswordValidationResult => {
  const checks: PasswordChecks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strengthDetails: PasswordStrengthDetails;

  if (score <= 2) {
    strengthDetails = {
      score,
      label: "Weak",
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
    };
  } else if (score <= 4) {
    strengthDetails = {
      score,
      label: "Medium",
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    };
  } else {
    strengthDetails = {
      score,
      label: "Strong",
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
    };
  }

  return {
    checks,
    score,
    strengthDetails,
    isValid: score === Object.keys(checks).length,
  };
};

export const passwordMatcher = (
  password: string,
  newPassword: string
): boolean => {
  return password === newPassword;
};
