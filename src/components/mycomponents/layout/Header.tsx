import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Bell, Settings, KeyRound, LogOut, Menu, Search, ShoppingCart, User, X, type LucideIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { logout } from "@/store/slices/authSlice";
import { clearStoredJwt } from "@/validations";
import {ThemeToggle,BrandLogo} from "@/components/icons";
import { routePaths } from "@/routes/routepaths/routePaths";
import { LocationSelector } from "@/components/mycomponents/ui/LocationSelector";
import type { AppDispatch, RootState } from "@/store/store";

type HeaderProps = {
  sidebarExpanded: boolean;
  onSidebarToggle: () => void;
};

// ─── Profile Menu ────────────────────────────────────────────────────────────
const ProfileMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : null;

  const handleLogout = useCallback(() => {
    clearStoredJwt();
    dispatch(logout());
    navigate(routePaths.login, { replace: true });
  }, [dispatch, navigate]);

  const handleSettings = useCallback(() => {
    // Settings page route — placeholder until route is created
    navigate(routePaths.dashboardSettings);
  }, [navigate]);

  const handleChangePassword = useCallback(() => {
    navigate(routePaths.forgotPassword);
  }, [navigate]);

  const menuItems: Array<{ label: string; icon: LucideIcon; onClick: () => void }> = [
    {
      label: "Settings",
      icon: Settings,
      onClick: handleSettings,
    },
    {
      label: "Change Password",
      icon: KeyRound,
      onClick: handleChangePassword,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="
          group/avatar
          rounded-full
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background
          hover:ring-2 hover:ring-violet-500/20
        "
        aria-label="Profile menu"
      >
        <Avatar size="lg" className="cursor-pointer">
          <AvatarFallback className="bg-linear-to-br from-violet-100 to-indigo-100 text-violet-700 dark:from-violet-900/40 dark:to-indigo-900/40 dark:text-violet-300">
            {initials || <User size={18} />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-52"
      >
        {user?.firstName && (
          <>
            <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-foreground">
              {user.firstName} {user.lastName || ""}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {menuItems.map(({ label, icon: Icon, onClick }) => (
          <DropdownMenuItem
            key={label}
            onClick={onClick}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm"
          >
            <Icon size={16} className="shrink-0 text-muted-foreground" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          variant="destructive"
          className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ─── Header ──────────────────────────────────────────────────────────────────
export default function Header({ sidebarExpanded, onSidebarToggle }: HeaderProps) {
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  return (<>
  <header
  className="
    sticky top-0 z-40
    w-full
    border-b border-border/60
    bg-background/80
    backdrop-blur-xl
    supports-backdrop-filter:bg-background/60
  "
>

    <div className="
  mx-auto flex h-16 w-full max-w-[1600px]
  items-center justify-between
  gap-2 px-3 sm:gap-4 sm:px-5 lg:px-8
">
  {/* Left Section */}
  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      className="md:hidden"
      onClick={onSidebarToggle}
      aria-label={sidebarExpanded ? "Close navigation" : "Open navigation"}
    >
      {sidebarExpanded ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
    </Button>

    <BrandLogo
      size={36}
      borderRadius="50%"
      showMargin={false}
    />

    <div
      className="hidden h-5 w-px shrink-0 bg-border/60 sm:block"
      aria-hidden="true"
    />

    <div className="min-w-0">
      <LocationSelector />
    </div>
  </div>

  {/* Right Section */}
  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
    <div className="relative hidden lg:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} aria-hidden="true" />
      <input
        type="search"
        placeholder="Search"
        aria-label="Search"
        className="h-9 w-44 rounded-lg border border-border bg-input/40 dark:bg-[#141720] pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>

    <Button type="button" variant="ghost" size="icon-lg" aria-label="Shopping cart" title="Shopping cart" className="relative">
      <ShoppingCart aria-hidden="true" />
      {cartCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
          {cartCount}
        </span>
      )}
    </Button>

    <Button type="button" variant="ghost" size="icon-lg" aria-label="Notifications" title="Notifications">
      <Bell aria-hidden="true" />
    </Button>

    <ThemeToggle />
    <ProfileMenu />
  </div>
</div>
</header>
  </>
     );
}
