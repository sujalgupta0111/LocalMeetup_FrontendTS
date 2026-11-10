import { useSelector } from "react-redux";
import { Bell, Menu, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui";
import { ThemeToggle, BrandLogo } from "@/components/icons";
import { LocationSelector } from "@/components/mycomponents/common/Header/LocationSelector";
import type { RootState } from "@/store/store";
import { ProfileMenu } from "@/components/mycomponents/common/Header/ProfileMenu";
import { UserNameBatch } from "@/components/mycomponents/common/Header/UserNameBatch";
type HeaderProps = {
  sidebarExpanded: boolean;
  onSidebarToggle: () => void;
};

// ─── Header ──────────────────────────────────────────────────────────────────
export default function Header({ sidebarExpanded, onSidebarToggle }: HeaderProps) {
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  return (
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
      {/* mx-auto, max-w-[1600px] aur default heavy horizontal padding hata di hai */}
      <div className="flex h-16 w-full items-center justify-between px-2 sm:px-4">
        {/* Left Section - Bilkul Left me rahega */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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

          <BrandLogo size={36} borderRadius="50%" showMargin={false} />

          <div
            className="hidden h-5 w-px shrink-0 bg-border/60 sm:block"
            aria-hidden="true"
          />
          <UserNameBatch />
              <div
            className="hidden h-5 w-px shrink-0 bg-border/60 sm:block"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <LocationSelector />
          </div>
        </div>

        {/* Right Section - Bilkul Right me rahega */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Shopping cart"
            title="Shopping cart"
            className="relative"
          >
            <ShoppingCart aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell aria-hidden="true" />
          </Button>

          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}