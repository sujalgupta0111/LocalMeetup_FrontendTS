import {
  useId,
  useState,
  type ChangeEventHandler,
  type InputHTMLAttributes,
  type HTMLInputTypeAttribute,
  type Ref,
} from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import Button from '@/components/mycomponents/ui/Button';

type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "id" | "onChange" | "placeholder" | "readOnly" | "required" | "type" | "value"
> & {
  type?: HTMLInputTypeAttribute;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  icon?: LucideIcon;
  isPassword?: boolean;
  showPasswordIcon?: LucideIcon;
  hidePasswordIcon?: LucideIcon;
  error?: string;
  className?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  ref?: Ref<HTMLInputElement>;
};

const cn = (...classes: Array<string | boolean | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const Input = ({
  type = "text",
  label = "",
  placeholder = "",
  value = "",
  onChange,

  // Left-side icon
  icon: Icon,

  // Password configuration
  isPassword = false,
  showPasswordIcon: ShowPasswordIcon = Eye,
  hidePasswordIcon: HidePasswordIcon = EyeOff,

  error = "",
  className = "",
  id,
  required = false,
  disabled = false,
  readOnly = false,

  // React 19: ref is received like a normal prop
  ref,

  ...rest
}: InputProps) => {
  const generatedId = useId();

  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword
    ? showPassword
      ? "text"
      : "password"
    : type;

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-foreground/80"
        >
          {label}

          {required && (
            <span
              className="ml-1 text-destructive"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="relative w-full">
        {/* Left Icon */}
        {Icon && (
          <Icon
            size={20}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          />
        )}

        {/* Input */}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-xl border border-border bg-input/40 dark:bg-[#141720] text-foreground placeholder:text-muted-foreground py-2.5 text-sm outline-none transition-all duration-200 caret-primary selection:bg-primary/20 selection:text-foreground",

            // Left padding
            Icon ? "pl-10" : "pl-4",
            // Right padding
            isPassword ? "pr-10" : "pr-4",
            // Border & Focus
            error
              ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
              : "border-border hover:border-muted-foreground/30 focus:border-ring focus:ring-2 focus:ring-ring/20 focus:bg-background",
            // Disabled
            disabled && "cursor-not-allowed bg-muted/60 text-muted-foreground opacity-60",

            className
          )}
        />

        {/* Password Toggle */}
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={togglePassword}
            disabled={disabled}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={showPassword}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2",
              "min-h-8 px-2",
              "text-muted-foreground",
              "hover:bg-transparent hover:text-foreground",
              "focus-visible:ring-0"
            )}
          >
            {showPassword ? (
              <HidePasswordIcon size={20} />
            ) : (
              <ShowPasswordIcon size={20} />
            )}
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;