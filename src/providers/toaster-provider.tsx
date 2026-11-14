import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { useTheme } from "@/providers/theme-provider";
import { DEFAULT_NOTIFICATION_DURATION } from "@/utils/notificationUtils";

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
        duration={DEFAULT_NOTIFICATION_DURATION}
      />
      {children}
    </>
  );
};

export default ToasterProvider;