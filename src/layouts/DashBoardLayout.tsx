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
    // min-h-screen ki jagah h-screen aur overflow-hidden lagaya hai taaki main layout viewport se bahar na jaye
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* 1. Header ko shrink-0 diya hai taaki ye kisi bhi content ki wajah se squeeze ya hide na ho */}
      <div className="shrink-0 z-20">
        <Header
          sidebarExpanded={sidebarExpanded}
          onSidebarToggle={() => handleSidebarChange(!sidebarExpanded)}
        />
      </div>

      {/* 2. Middle area viewport ke bache hue hisse ko fill karega (min-h-0 overflow-hidden zaroori hai flex child ke liye) */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          expanded={sidebarExpanded}
          onExpandedChange={handleSidebarChange}
        />

        {/* Content area: iske andar scrolling allow ki hai */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* <SecondaryNav /> */}

          {/* Sirf main content scroll hoga, Header apni jagah freeze rahega */}
          <main className="flex h-full w-full flex-1 flex-col overflow-y-auto overflow-x-hidden p-0 relative">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 3. Footer bhi apni jagah fixed rahega */}
      <div className="shrink-0 z-10">
        <Footer />
      </div>
    </div>
  );
};

export default DashBoardLayout;