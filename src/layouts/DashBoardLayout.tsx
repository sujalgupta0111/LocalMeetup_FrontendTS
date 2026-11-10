import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Header,
  Sidebar,
  Footer,
  SecondaryNav,
} from "@/components/mycomponents/common";

const DashBoardLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  const handleSidebarChange = useCallback((expanded: boolean): void => {
    setSidebarExpanded(expanded);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 1. Header ke baad koi margin nahi hai */}
      <Header
        sidebarExpanded={sidebarExpanded}
        onSidebarToggle={() => handleSidebarChange(!sidebarExpanded)}
      />

      {/* 2. Middle layout area */}
      <div className="flex min-h-0 flex-1">
        <Sidebar expanded={sidebarExpanded} onExpandedChange={handleSidebarChange}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* <SecondaryNav /> */}

          {/* Saari padding (horizontal & vertical) aur mx-auto hata di gayi hai */}
          <main className="flex h-full w-full flex-1 flex-col p-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 3. Footer ke saath koi gap nahi */}
      <Footer />
    </div>
  );
};

export default DashBoardLayout;