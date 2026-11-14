import React from 'react';
import { Plus, User, MessageSquarePlus, Users, UserPlus, LogOut } from 'lucide-react';
import FloatingButton from '@/components/mycomponents/ui/FloatingButton';

interface ChatFeatureProps {
  onOpenProfile: () => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenRequests: () => void;
  onLogout: () => void;
  pendingRequestsCount?: number;
}

export const ChatFeature: React.FC<ChatFeatureProps> = ({
  onOpenProfile,
  onOpenNewChat,
  onOpenNewGroup,
  onOpenRequests,
  onLogout,
  pendingRequestsCount = 0,
}) => {
  return (
    <FloatingButton
      // 1. Icon Prop
      icon={<Plus className="w-6 h-6" />}

      // 2. Collapsed Component Prop (Normal floating state me badge ya status indicator)
      collapsedComponent={
        pendingRequestsCount > 0 ? (
          <span className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-extrabold flex items-center justify-center border-2 border-background animate-pulse">
            {pendingRequestsCount}
          </span>
        ) : null
      }

      // 3. Expanded Content Prop (Hover karne par khulne wala pura component/menu)
      expandedContent={
        <div className="w-56 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-950/25 ring-1 ring-black/5 divide-y divide-slate-100 dark:divide-slate-800/80">
          <div className="py-1">
            <button
              onClick={onOpenProfile}
              className="w-full px-3 py-2.5 rounded-xl flex items-center space-x-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <span>Profile Settings</span>
            </button>

            <button
              onClick={onOpenNewChat}
              className="w-full px-3 py-2.5 rounded-xl flex items-center space-x-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
            >
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <MessageSquarePlus className="w-4 h-4" />
              </div>
              <span>New Conversation</span>
            </button>

            <button
              onClick={onOpenNewGroup}
              className="w-full px-3 py-2.5 rounded-xl flex items-center space-x-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
            >
              <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                <Users className="w-4 h-4" />
              </div>
              <span>Create Group</span>
            </button>

            <button
              onClick={onOpenRequests}
              className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Requests</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>

          <div className="pt-1">
            <button
              onClick={onLogout}
              className="w-full px-3 py-2.5 rounded-xl flex items-center space-x-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                <LogOut className="w-4 h-4" />
              </div>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      }
    />
  );
};

export default ChatFeature;