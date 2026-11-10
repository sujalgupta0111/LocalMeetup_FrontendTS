
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Settings,
  KeyRound,
  LogOut,
  User,
  type LucideIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";

import { logout } from "@/store/slices/authSlice";
import { clearStoredJwt } from "@/validations";
import { routePaths } from "@/routes/routepaths/routePaths";
import type { AppDispatch, RootState } from "@/store/store";

export const ProfileMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const hoverCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = useSelector(
    (state: RootState) => state.auth.user
  );

  const cancelHoverClose = useCallback(() => {
    if (hoverCloseTimeout.current !== null) {
      clearTimeout(hoverCloseTimeout.current);
      hoverCloseTimeout.current = null;
    }
  }, []);

  const handlePointerEnter = useCallback(
    (pointerType: string) => {
      if (pointerType === "mouse" || pointerType === "pen") {
        cancelHoverClose();
        setOpen(true);
      }
    },
    [cancelHoverClose]
  );

  const handlePointerLeave = useCallback(() => {
    cancelHoverClose();
    hoverCloseTimeout.current = setTimeout(() => {
      setOpen(false);
      hoverCloseTimeout.current = null;
    }, 180);
  }, [cancelHoverClose]);

  useEffect(
    () => () => { cancelHoverClose(); },
    [cancelHoverClose]
  );

  const initials = user?.firstName? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase() : null;

  const handleLogout = useCallback(() => {
    clearStoredJwt();
    dispatch(logout());
    navigate(routePaths.login, { replace: true });
  }, [dispatch, navigate]);

  const menuItems: Array<{ label: string; icon: LucideIcon; onClick: () => void;}> = [
    {
      label: "Settings",
      icon: Settings,
      onClick: () => navigate(routePaths.dashboardSettings),
    },
    {
      label: "Change Password",
      icon: KeyRound,
      onClick: () => navigate(routePaths.forgotPassword),
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        onPointerEnter={(event) => handlePointerEnter(event.pointerType)}
        onPointerLeave={handlePointerLeave}
        className="
          rounded-full transition-all duration-200
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-violet-500/40
          focus-visible:ring-offset-2 focus-visible:ring-offset-background
          hover:ring-2 hover:ring-violet-500/20
        "
        aria-label="Profile menu. Hover or activate to open."
      >
        <Avatar size="lg" className="cursor-pointer">
          <AvatarFallback className="
            bg-linear-to-br from-violet-100 to-indigo-100
            text-violet-700
            dark:from-violet-900/40 dark:to-indigo-900/40
            dark:text-violet-300
          ">
            {initials || <User size={18} />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        onPointerEnter={(event) => handlePointerEnter(event.pointerType)}
        onPointerLeave={handlePointerLeave}
        className="w-52"
      >
        {user?.firstName && (
          <>
            <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold">
              {user.firstName} {user.lastName || ""}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {menuItems.map(({ label, icon: Icon, onClick }) => (
          <DropdownMenuItem
            key={label}
            onClick={onClick}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2"
          >
            <Icon size={16} className="text-muted-foreground" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          variant="destructive"
          className="flex cursor-pointer items-center gap-2.5 px-3 py-2"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
