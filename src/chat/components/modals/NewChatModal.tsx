import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { usersApi } from '../../api/users';
import { contactsApi } from '../../api/contacts';
import { conversationsApi } from '../../api/conversations';
import type { UserSearchResult } from '../../types';
import { Search, UserPlus, MessageSquare, Check, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveConversationId, addOrUpdateConversation } from '../../store/slices/chatSlice';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const res = await usersApi.searchUsers(query.trim());
          setResults(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleStartChat = async (targetUserId: string) => {
    setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const conv = await conversationsApi.createDirectConversation(targetUserId);
      dispatch(addOrUpdateConversation(conv));
      dispatch(setActiveConversationId(conv.id));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleSendContactRequest = async (targetUserId: string) => {
    setActionLoading((prev) => ({ ...prev, [`req_${targetUserId}`]: true }));
    try {
      await contactsApi.sendRequest(targetUserId);
      setResults((prev) =>
        prev.map((r) =>
          r.user.id === targetUserId ? { ...r, isPendingSent: true } : r
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`req_${targetUserId}`]: false }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Chat or Contact">
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username, full name, or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm"
            autoFocus
          />
        </div>

        {/* Results List */}
        <div className="min-h-[220px] max-h-[340px] overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500 mb-2" />
              Searching users...
            </div>
          ) : results.length > 0 ? (
            results.map(({ user, isContact, isPendingSent }) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar
                    src={user.avatarUrl}
                    name={`${user.firstName} ${user.lastName}`}
                    isOnline={user.isOnline}
                    showStatus
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!isContact && !isPendingSent && (
                    <button
                      onClick={() => handleSendContactRequest(user.id)}
                      disabled={actionLoading[`req_${user.id}`]}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center space-x-1.5 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}

                  {isPendingSent && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 text-xs font-medium flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  )}

                  <button
                    onClick={() => handleStartChat(user.id)}
                    disabled={actionLoading[user.id]}
                    className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            ))
          ) : query.trim() ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
              <p>No users found matching &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm text-center px-4">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p>Type a username, name, or email to find and connect with friends.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
