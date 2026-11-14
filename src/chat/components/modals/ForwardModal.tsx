import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import type { Conversation, Message } from '../../types';
import { messagesApi } from '../../api/messages';
import { Send, Check, Loader2 } from 'lucide-react';

interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  conversations: Conversation[];
}

export const ForwardModal: React.FC<ForwardModalProps> = ({
  isOpen,
  onClose,
  message,
  conversations,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!message) return null;

  const handleForward = async () => {
    if (!selectedConvId) return;
    setSending(true);
    try {
      await messagesApi.sendMessage({
        conversationId: selectedConvId,
        content: message.content,
        messageType: message.messageType,
        isForwarded: true,
        attachments: message.attachments?.map((a) => ({
          fileUrl: a.fileUrl,
          fileName: a.fileName,
          fileType: a.fileType,
          fileSize: a.fileSize,
        })),
      });

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to forward message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Forward Message">
      <div className="space-y-4">
        {/* Message preview snippet */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-l-4 border-primary-500 text-xs text-slate-700 dark:text-slate-300 italic">
          &quot;{message.content || '[Attachment]'}&quot;
        </div>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Select Conversation:
        </p>

        <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
          {conversations.map((c) => {
            const isSelected = selectedConvId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedConvId(c.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-primary-50 dark:bg-primary-950/40 border border-primary-500/40 text-primary-900 dark:text-primary-100'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar
                    src={c.avatarUrl}
                    name={c.name || 'Chat'}
                    isOnline={c.otherUser?.isOnline}
                    showStatus={c.type === 'DIRECT'}
                    size="sm"
                  />
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{c.name || 'Chat'}</p>
                    <p className="text-xs text-slate-400 capitalize">{c.type.toLowerCase()} chat</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                    isSelected
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={!selectedConvId || sending || sentSuccess}
            className={`px-5 py-2 rounded-xl text-white text-sm font-medium flex items-center space-x-2 shadow-sm transition ${
              sentSuccess
                ? 'bg-emerald-600'
                : 'bg-primary-600 hover:bg-primary-700 disabled:opacity-50'
            }`}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : sentSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{sentSuccess ? 'Forwarded!' : 'Forward'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
