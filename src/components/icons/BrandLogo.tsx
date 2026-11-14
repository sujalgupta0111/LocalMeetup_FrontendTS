
import { loginPageBrandLogoText } from "@/constants/pagecostants";
import type { BrandLogoProps } from "@/types/interface";

export const BrandLogo = ({
  loginPageBrandLogo = loginPageBrandLogoText,
  size = 64,
  borderRadius = "16px",
  fontSize,
  showMargin = true,
}: BrandLogoProps) => {
  const calculatedFontSize = fontSize ?? size * 0.4;

  return (
    <div className={`flex justify-center ${showMargin ? "mb-7" : ""}`}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius,
          fontSize: `${calculatedFontSize}px`,
        }}
        className="
          flex shrink-0
          items-center justify-center
          bg-linear-to-br
          from-violet-600 via-indigo-600 to-cyan-500
          font-bold leading-none text-white
          shadow-xl shadow-violet-500/25
          ring-4 ring-violet-500/15 dark:ring-violet-500/25
        "
      >
        {loginPageBrandLogo}
      </div>
    </div>
  );
};

export default BrandLogo;
