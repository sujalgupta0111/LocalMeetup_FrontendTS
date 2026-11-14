import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { notification, DEFAULT_NOTIFICATION_DURATION } from "./notificationUtils";

describe("notification utility", () => {
  const customToast = vi.spyOn(toast, "custom");
  const dismissToast = vi.spyOn(toast, "dismiss");

  beforeEach(() => {
    customToast.mockReset().mockReturnValue("notification-id");
    dismissToast.mockReset().mockReturnValue("notification-id");
  });

  it.each([
    ["success", "success"],
    ["error", "error"],
    ["warning", "warning"],
    ["info", "info"],
  ] as const)("renders %s notifications through Sonner", (method, type) => {
    notification[method]("A dynamic notification");

    const [renderNotification, options] = customToast.mock.calls[0];
    const markup = renderToStaticMarkup(renderNotification("notification-id"));

    expect(options).toEqual({
      duration: DEFAULT_NOTIFICATION_DURATION,
      closeButton: false,
    });
    expect(markup).toContain("A dynamic notification");
    expect(markup).toContain(`data-notification-type="${type}"`);
    expect(markup).toContain('aria-label="Dismiss notification"');
  });

  it("uses a caller-provided duration and allows manual dismissal", () => {
    notification.success("Saved", 3000);

    const [renderNotification, options] = customToast.mock.calls[0];
    const element = renderNotification("notification-id") as ReactElement<{
      onDismiss: () => void;
    }>;

    expect(options?.duration).toBe(3000);
    element.props.onDismiss();
    expect(dismissToast).toHaveBeenCalledWith("notification-id");
  });

  it("keeps simultaneous notifications independent", () => {
    notification.info("First");
    notification.warning("Second");

    expect(customToast).toHaveBeenCalledTimes(2);
  });

  it("rejects invalid durations rather than silently changing them", () => {
    expect(() => notification.info("Invalid", Number.NaN)).toThrow(RangeError);
  });
});
