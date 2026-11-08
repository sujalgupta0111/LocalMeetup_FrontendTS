
import { Moon, Sun } from "lucide-react";
import type { ReactElement } from "react";

import { Button } from "@/components/ui";
import { useTheme } from "@/providers/theme-provider";

export default function ThemeToggle(): ReactElement {
  const { setTheme } = useTheme();

  const toggleTheme = (): void => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="relative rounded-full text-foreground/80 hover:bg-accent/60 hover:text-foreground transition-colors"
    >
      <Sun className="size-[1.2rem] transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0 dark:hidden text-amber-500" aria-hidden="true" />
      <Moon className="size-[1.2rem] transition-all hidden dark:block text-violet-400 rotate-90 scale-0 dark:rotate-0 dark:scale-100" aria-hidden="true" />
    </Button>
  );
}
