import React from "react";
import { LeftSidebar } from '../chat/components/sidebar/LeftSidebar';
import { CenterPanel } from '../chat/components/chat/CenterPanel';
import { RightPanel } from '../chat/components/chat/RightPanel';
import { useWebSocket } from '../chat/hooks/useWebSocket';

export const VartalapPage: React.FC = () => {
  const { sendTyping, sendReceipt } = useWebSocket();
 
   return (
     <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
       {/* 1. Left Sidebar */}
       <LeftSidebar />
 
       {/* 2. Center Chat Panel */}
       <CenterPanel sendTyping={sendTyping} sendReceipt={sendReceipt} />
 
       {/* 3. Right Details & Shared Media Panel */}
       <RightPanel />
     </div>
   );
};

export default VartalapPage;