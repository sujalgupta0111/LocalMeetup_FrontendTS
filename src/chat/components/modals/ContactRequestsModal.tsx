import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { contactsApi } from '../../api/contacts';
import type { ContactRequest } from '../../types';
import { Check, X, Clock, Loader2 } from 'lucide-react';

interface ContactRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestHandled?: () => void;
}

export const ContactRequestsModal: React.FC<ContactRequestsModalProps> = ({
  isOpen,
  onClose,
  onRequestHandled,
}) => {
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [pending, setPending] = useState<ContactRequest[]>([]);
  const [sent, setSent] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingData, sentData] = await Promise.all([
        contactsApi.getPendingRequests(),
        contactsApi.getSentRequests(),
      ]);
      setPending(pendingData);
      setSent(sentData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleAccept = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await contactsApi.acceptRequest(requestId);
      setPending((prev) => prev.filter((r) => r.id !== requestId));
      onRequestHandled?.();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await contactsApi.rejectRequest(requestId);
      setPending((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Requests">
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setTab('received')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'received'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Received ({pending.length})
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'sent'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Sent ({sent.length})
          </button>
        </div>

        {/* Content list */}
        <div className="min-h-[220px] max-h-[340px] overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500 mr-2" />
              Loading requests...
            </div>
          ) : tab === 'received' ? (
            pending.length > 0 ? (
              pending.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar
                      src={req.sender.avatarUrl}
                      name={`${req.sender.firstName} ${req.sender.lastName}`}
                      isOnline={req.sender.isOnline}
                      showStatus
                    />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {req.sender.firstName} {req.sender.lastName}
                      </p>
                      <p className="text-xs text-slate-400">@{req.sender.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading[req.id]}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={actionLoading[req.id]}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                <Check className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p>No pending contact requests</p>
              </div>
            )
          ) : sent.length > 0 ? (
            sent.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar
                    src={req.receiver.avatarUrl}
                    name={`${req.receiver.firstName} ${req.receiver.lastName}`}
                    isOnline={req.receiver.isOnline}
                    showStatus
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {req.receiver.firstName} {req.receiver.lastName}
                    </p>
                    <p className="text-xs text-slate-400">@{req.receiver.username}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 text-xs font-medium flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Pending response</span>
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p>You have not sent any pending requests</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
