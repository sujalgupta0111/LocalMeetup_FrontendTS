import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { useTheme } from "@/providers/theme-provider";

type ToasterProviderProps = {
  children: ReactNode;
};

const ToasterProvider = ({ children }: ToasterProviderProps) => {
  const { theme } = useTheme();

  return (
    <>
      <Toaster
        theme={theme as "light" | "dark" | "system"}
        position="top-right"
        richColors
        closeButton
      />
      {children}
    </>
  );
};

export default ToasterProvider;