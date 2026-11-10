import { useEffect } from "react";
import { NavLink, type NavLinkRenderProps } from "react-router-dom";
import {
  FileText,
  HelpCircle,
  Home,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { routePaths } from "@/routes/routepaths/routePaths";

type SidebarItemData = {
  label: string;
  icon: LucideIcon;
  to: string | null;
  end?: boolean;
};

type SidebarItemProps = {
  item: SidebarItemData;
  expanded: boolean;
};

type SidebarProps = {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

const primaryItems: SidebarItemData[] = [
  { label: "Home", icon: Home, to: routePaths.dashboard, end: true },
  { label: "Vartalap", icon: MessageCircle, to: routePaths.dashboardVartalap },
  { label: "Viber", icon: Radio, to: routePaths.dashboardViber },
  { label: "Shop", icon: ShoppingBag, to: routePaths.dashboardShop },
  { label: "Posts", icon: FileText, to: routePaths.dashboardPosts },
];

const utilityItems: SidebarItemData[] = [
  { label: "Settings", icon: Settings, to: routePaths.dashboardSettings },
  { label: "Help", icon: HelpCircle, to: null },
];

function SidebarItem({ item, expanded }: SidebarItemProps) {
  const content = ({ isActive = false }: Partial<NavLinkRenderProps>) => (
    <>
      <item.icon
        size={19}
        className={cn(
          "shrink-0 transition-colors",
          isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap transition-[opacity,transform,max-width] duration-300",
          expanded ? "max-w-40 translate-x-0 opacity-100" : "max-w-0 -translate-x-2 opacity-0"
        )}
      >
        {item.label}
      </span>
      {!expanded && <span className="sr-only">{item.label}</span>}
    </>
  );

  const className = ({ isActive = false }: Partial<NavLinkRenderProps>) =>
    cn(
      "group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors",
      expanded ? "justify-start" : "justify-center",
      isActive
        ? "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300"
        : "text-foreground/70 hover:bg-accent/10 hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
    );

  if (!item.to) {
    return (
      <button type="button" className={className({})} aria-label="Help">
        {content({})}
      </button>
    );
  }

  return (
    <NavLink to={item.to} end={item.end} className={className} title={!expanded ? item.label : undefined}>
      {content}
    </NavLink>
  );
}

export default function Sidebar({ expanded, onExpandedChange }: SidebarProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onExpandedChange(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onExpandedChange]);

  return (
    <aside
      aria-label="Primary navigation"
      onMouseEnter={() => onExpandedChange(true)}
      onMouseLeave={() => onExpandedChange(false)}
      className={cn(
        "group/sidebar relative z-20 shrink-0 border-r border-border/60 bg-background/90 transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "motion-reduce:transition-none",
        expanded ? "w-60" : "w-18",
        "max-md:fixed max-md:inset-y-16 max-md:left-0 max-md:shadow-xl",
        expanded ? "max-md:w-60 max-md:translate-x-0" : "max-md:w-0 max-md:-translate-x-full"
      )}
    >
      <div className="sticky top-16 flex h-[calc(100vh-8rem)] min-h-105 flex-col gap-6 overflow-hidden px-3 py-5">
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          className="absolute right-2 top-3 hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 md:block"
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
        >
          {expanded ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        </button>

        <nav className="mt-8 flex flex-col gap-1" aria-label="Primary">
          {primaryItems.map((item) => (
            <SidebarItem key={item.label} item={item} expanded={expanded} />
          ))}
        </nav>

        <div className="h-px bg-border/70" aria-hidden="true" />

        <nav className="flex flex-col gap-1" aria-label="Utility">
          {utilityItems.map((item) => (
            <SidebarItem key={item.label} item={item} expanded={expanded} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
