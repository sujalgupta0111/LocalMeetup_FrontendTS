
import type {OAuthAuthResponse} from "@/types/interface";
import type { ReactNode } from "react";
import type { ChangeEventHandler } from "react";

export type OAuthProvider = "google" | "github" | "facebook" | "discord";
export type OAuthPopupMessage =
  | {
      type: "oauth:result";
      status: "success";
      provider: OAuthProvider;
      code: string;
      message?: string;
    }
  | {
      type: "oauth:result";
      status: "error";
      provider?: OAuthProvider | "unknown";
      message?: string;
    };

export type OAuthProviderConfig = {
  provider: OAuthProvider;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
};

export type OAuthButtonProps = {
  outhconfig: OAuthProviderConfig;
  isLableVisible?: boolean;
  disabled?: boolean;
  onAuthenticated: (response: OAuthAuthResponse) => void;
  onError: (message: string) => void;
};
/* *********************************Registration Page*************************************************** */
export type AccountInfoFields = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
};

export type AccountInfoStepProps = {
    formDetails: AccountInfoFields;
    updateField: (field: keyof AccountInfoFields) => ChangeEventHandler<HTMLInputElement>;
    errors: Partial<Record<keyof AccountInfoFields, string>>;
    inputClass?: string;
};

export type AddressFields = {
    houseNo: string;
    country: string;
    state: string;
    city: string;
    street: string;
    pincode: string;
};

export type AddressStepProps = {
    formDetails: AddressFields;
    updateField: (field: keyof AddressFields) => ChangeEventHandler<HTMLInputElement>;
    errors: Partial<Record<keyof AddressFields, string>>;
    inputClass?: string;
};

export type PasswordFields = {
    password: string;
    confirmPassword: string;
};

export type PasswordStepProps = {
    formDetails: PasswordFields;
    updateField: (field: keyof PasswordFields) => ChangeEventHandler<HTMLInputElement>;
    errors: Partial<Record<keyof PasswordFields, string>>;
    inputClass?: string;
};

export    type PasswordChecks = {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
};

export type PasswordCriteriaListProps = {
    checks: PasswordChecks;
};

export type PasswordStrengthProps = {
    password?: string;
    confirmPassword?: string;
};

