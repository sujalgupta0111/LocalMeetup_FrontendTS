
import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Header,
  Sidebar,
  Footer,
  SecondaryNav,
} from "@/components/mycomponents/layout";

const MainLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  const handleSidebarChange = useCallback((expanded: boolean): void => {
    setSidebarExpanded(expanded);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        sidebarExpanded={sidebarExpanded}
        onSidebarToggle={() => handleSidebarChange(!sidebarExpanded)}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          expanded={sidebarExpanded}
          onExpandedChange={handleSidebarChange}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <SecondaryNav />

          <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
