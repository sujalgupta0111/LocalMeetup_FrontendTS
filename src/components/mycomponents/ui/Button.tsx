import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
  outline: "border border-border bg-card/60 text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95",
  ghost: "bg-transparent text-foreground/80 hover:bg-accent hover:text-foreground active:bg-accent/80",
};

const sizeStyles = {
  sm: "min-h-8 px-3 text-sm",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
};

const iconSizeStyles = {
  sm: "[&>svg]:size-4",
  md: "[&>svg]:size-5",
  lg: "[&>svg]:size-5",
};

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> & {
  children?: ReactNode;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  loadingContent?: "inline" | "replace";
  preserveWidth?: boolean;
  iconOnly?: boolean;
};

const Spinner = () => {
  return (
    <svg
      className="size-4 shrink-0 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      type = "button",
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      loadingText,
      loadingContent = "inline",
      preserveWidth = true,
      disabled = false,
      iconOnly = false, // 👈 New prop
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    void preserveWidth;
    const isDisabled = disabled || loading;
    const content = loading
      ? loadingText ?? children
      : children;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled || undefined}
        aria-label={ariaLabel}
        className={clsx(
          // Base
          "inline-flex items-center justify-center gap-2",
          "font-medium",
          "whitespace-nowrap",
          "transition-colors duration-200",
          "select-none",

          // Shape
          iconOnly ? "rounded-full" : "rounded-lg",

          // Focus
          "focus:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-ring",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-background",

          // Disabled
          "disabled:pointer-events-none",
          "disabled:cursor-not-allowed",
          "disabled:opacity-50",

          // Reduced motion
          "motion-reduce:transition-none",

          // Variant
          variantStyles[variant],

          // Size
          iconOnly
            ? "size-12 shrink-0 p-0"
            : sizeStyles[size],

          // Icon size
          iconSizeStyles[size],

          // Custom class
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner />
            {!iconOnly && (
              loadingContent === "replace" ? (
                <span>{loadingText ?? "Loading..."}</span>
              ) : (
                <span>{content}</span>
              )
            )}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}

            {!iconOnly && <span>{children}</span>}

            {iconOnly && children}

            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);


Button.displayName = "Button";

export default Button;