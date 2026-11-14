import { passwordMatcher, validatePasswordInformation } from "@/validations/passwordValidator";
import type { PasswordStrengthProps, PasswordCriteriaListProps } from "@/types/types";

// Sub-component for Checklist Validation
const PasswordCriteriaList = ({ checks }: PasswordCriteriaListProps) => {
    const criteria = [
        { id: 'minLength', label: 'At least 8 characters' },
        { id: 'uppercase', label: 'One uppercase letter' },
        { id: 'lowercase', label: 'One lowercase letter' },
        { id: 'number', label: 'One number' },
        { id: 'specialChar', label: 'One special character' },
    ] as const;

    return (
        <ul className="mt-4 space-y-2">
            {criteria.map((item) => {
                const isMet = checks[item.id];
                return (
                    <li 
                        key={item.id} 
                        className={`flex items-center text-sm transition-colors duration-300 ${
                            isMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                        }`}
                    >
                        {isMet ? (
                            // Green Right Tick SVG
                            <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        ) : (
                            // Circle SVG for pending checks
                            <svg className="w-4 h-4 mr-2 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                            </svg>
                        )}
                        {item.label}
                    </li>
                );
            })}
        </ul>
    );
};

// Main Component
const PasswordStrength = ({ password = "", confirmPassword = "" }: PasswordStrengthProps) => {
    if (!password) {
        return null;
    }

    // Getting validation details from utility
    const { checks, score, strengthDetails } = validatePasswordInformation(password);
    const isMatch = passwordMatcher(password, confirmPassword);
    void isMatch;
    const { label, color, textColor } = strengthDetails;

    return (
        <div className="mt-3 space-y-3 bg-card/60 dark:bg-muted/30 p-4 rounded-xl border border-border">
            {/* Strength Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>Password strength</span>
                    {label && <span className={textColor}>{label}</span>}
                </div>

                <div className="flex gap-1.5">
                    {/* Since there are 5 checks, we map 5 bars */}
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                                level <= score ? color : "bg-muted"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Validation Checklist */}
            <PasswordCriteriaList checks={checks} />

       
        </div>
    );
};

export default PasswordStrength;