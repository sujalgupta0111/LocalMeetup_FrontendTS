import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { routePaths } from "@/routes/routepaths/routePaths";

const tabs = [
  { label: "Overview", to: routePaths.dashboard, end: true },
  { label: "Reports", to: routePaths.dashboardPosts },
  { label: "Statistics", to: routePaths.dashboardShop },
  { label: "Activity", to: routePaths.dashboardVartalap },
  { label: "Settings", to: routePaths.dashboardSettings },
  { label: "2", to: routePaths.dashboardSettings },
];

export default function SecondaryNav() {
  return (
    <nav className="border-b border-border/60 bg-background/80" aria-label="Secondary navigation">
      <div className="overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-1 px-4 sm:px-6 lg:px-8">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "relative flex h-12 items-center px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                  isActive
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {tab.label}
                  {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-violet-600" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
