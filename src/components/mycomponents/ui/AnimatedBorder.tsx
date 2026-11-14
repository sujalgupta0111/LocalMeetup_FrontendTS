import type { ReactNode } from "react";

const colorStyles = {
  purple: {
    gradient:
      "bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,#8b5cf6_290deg,#c084fc_320deg,transparent_360deg)]",
  },

  red: {
    gradient:
      "bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,#ef4444_290deg,#fca5a5_320deg,transparent_360deg)]",
  },

  blue: {
    gradient:
      "bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,#3b82f6_290deg,#93c5fd_320deg,transparent_360deg)]",
  },

  green: {
    gradient:
      "bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,#22c55e_290deg,#86efac_320deg,transparent_360deg)]",
  },
};

type AnimatedBorderProps = {
  children: ReactNode;
  color?: keyof typeof colorStyles;
  className?: string;
  borderRadius?: string;
};

const AnimatedBorder = ({
  children,
  color = "purple",
  className = "",
  borderRadius = "rounded-2xl",
}: AnimatedBorderProps) => {
  const selectedColor = colorStyles[color] || colorStyles.purple;

  return (
    <div className={`relative isolate ${borderRadius} p-px ${className}`}>
      {/* Animated gradient border */}
      <div
        className={`
          pointer-events-none
          absolute
          inset-0
          -z-10
          ${borderRadius}
          overflow-hidden
        `}
      >
        <div
          className={`
            absolute
            -inset-full
            ${selectedColor.gradient}
            animate-[spin_4s_linear_infinite]
          `}
        />
      </div>

      {/* Content */}
      <div className={`relative ${borderRadius} bg-card text-card-foreground`}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorder;