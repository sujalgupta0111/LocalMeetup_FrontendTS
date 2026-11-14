import { Input } from "@/components/mycomponents/ui";
import PasswordStrength from "./PasswordStrength";
import { passwordMatcher } from "@/validations/passwordValidator";
import type { PasswordStepProps } from "@/types/types";



const PasswordStep = ({ formDetails, updateField, errors, inputClass = "" }: PasswordStepProps) => {
    const isMatch = passwordMatcher(
        formDetails.password,
        formDetails.confirmPassword
    );

    return (
        <div className="grid gap-5 space-y-5 sm:grid-cols-1">
            <div>
                <Input
                    label="Password"
                    isPassword
                    autoComplete="new-password"
                    value={formDetails.password}
                    onChange={updateField("password")}
                    error={errors.password}
                    className={inputClass}
                />

                <PasswordStrength
                    password={formDetails.password}
                    confirmPassword={formDetails.confirmPassword}
                />
            </div>

            <div>
                <Input
                    label="Confirm password"
                    isPassword
                    autoComplete="new-password"
                    value={formDetails.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    error={errors.confirmPassword}
                    className={inputClass}
                />

                {formDetails.confirmPassword && (
                    <p
                        className={`mt-1 flex items-center gap-1 text-xs ${
                            isMatch
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                        }`}
                    >
                        {isMatch ? (
                            <>
                                <svg
                                    className="h-4 w-4 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>

                                <span>Passwords match</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    className="h-4 w-4 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>

                                <span>Passwords do not match</span>
                            </>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PasswordStep;
