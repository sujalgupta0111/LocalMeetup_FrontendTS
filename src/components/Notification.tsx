import {
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  message: ReactNode;
  type: NotificationType;
  onDismiss: () => void;
}

const notificationStyles = {
  success: {
    Icon: CheckCircle2,
    container: "border-emerald-500/30 bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    Icon: XCircle,
    container: "border-red-500/30 bg-red-50 text-red-950 dark:bg-red-950 dark:text-red-50",
    icon: "text-red-600 dark:text-red-400",
  },
  warning: {
    Icon: TriangleAlert,
    container: "border-amber-500/30 bg-amber-50 text-amber-950 dark:bg-amber-950 dark:text-amber-50",
    icon: "text-amber-600 dark:text-amber-400",
  },
  info: {
    Icon: Info,
    container: "border-sky-500/30 bg-sky-50 text-sky-950 dark:bg-sky-950 dark:text-sky-50",
    icon: "text-sky-600 dark:text-sky-400",
  },
} satisfies Record<
  NotificationType,
  {
    Icon: typeof Info;
    container: string;
    icon: string;
  }
>;

const Notification = ({ message, type, onDismiss }: NotificationProps) => {
  const { Icon, container, icon } = notificationStyles[type];

  return (
    <div
      data-notification-type={type}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`animate-in fade-in slide-in-from-top-2 flex w-full items-center gap-3 rounded-xl border px-4 py-3 shadow-lg duration-200 ${container}`}
    >
      <Icon className={`size-5 shrink-0 ${icon}`} aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Notification;
