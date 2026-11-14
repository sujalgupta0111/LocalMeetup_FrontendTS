import { createElement } from "react";
import { toast } from "sonner";
import Notification, { type NotificationType } from "@/components/Notification";

export const DEFAULT_NOTIFICATION_DURATION = 5000;

const showNotification = (
  message: string,
  type: NotificationType,
  duration = DEFAULT_NOTIFICATION_DURATION
): string | number => {
  if (!Number.isFinite(duration) || duration < 0) {
    throw new RangeError("Notification duration must be a non-negative number.");
  }

  return toast.custom(
    (id) =>
      createElement(Notification, {
        message,
        type,
        onDismiss: () => toast.dismiss(id),
      }),
    { duration, closeButton: false }
  );
};

export const notification = {
  success: (message: string, duration?: number) =>
    showNotification(message, "success", duration),
  error: (message: string, duration?: number) =>
    showNotification(message, "error", duration),
  warning: (message: string, duration?: number) =>
    showNotification(message, "warning", duration),
  info: (message: string, duration?: number) =>
    showNotification(message, "info", duration),
};
