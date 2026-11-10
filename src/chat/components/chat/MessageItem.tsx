import React, { useState } from 'react';
import type { Message } from '../../types';
import { formatTime, formatFileSize } from '../../utils/format';
import {
  Check,
  CheckCheck,
  Reply,
  Forward,
  Edit2,
  Trash2,
  Smile,
  FileText,
  Download,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onReact: (message: Message, emoji: string) => void;
  onImageClick: (imageUrl: string, imageName: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '🎉'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onReact,
  onImageClick,
}) => {
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [showReactionsBar, setShowReactionsBar] = useState(false);

  // Determine delivery/read status
  const getReceiptStatus = () => {
    if (!message.receipts || message.receipts.length === 0) return 'SENT';
    const otherReceipts = message.receipts.filter((r) => r.userId !== message.senderId);
    if (otherReceipts.some((r) => r.status === 'READ')) return 'READ';
    if (otherReceipts.some((r) => r.status === 'DELIVERED')) return 'DELIVERED';
    return 'SENT';
  };

  const receiptStatus = getReceiptStatus();

  // Aggregate reactions
  const reactionCounts: Record<string, { count: number; userReacted: boolean }> = {};
  message.reactions?.forEach((r) => {
    if (!reactionCounts[r.emoji]) {
      reactionCounts[r.emoji] = { count: 0, userReacted: false };
    }
    reactionCounts[r.emoji].count += 1;
    if (r.userId === currentUserId) {
      reactionCounts[r.emoji].userReacted = true;
    }
  });

  return (
    <div
      className={`group relative flex flex-col mb-2.5 transition-all ${
        isOwn ? 'items-end' : 'items-start'
      }`}
    >
      {/* Sender name for group chats if received */}
      {!isOwn && (
        <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 ml-3 mb-1">
          {message.sender?.firstName} {message.sender?.lastName}
        </span>
      )}

      {/* Main Bubble Container */}
      <div className="relative max-w-[85%] sm:max-w-[70%]">
        {/* Hover Action Menu */}
        <div
          className={`absolute -top-4 z-20 hidden group-hover:flex items-center space-x-0.5 p-1 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-500 transition ${
            isOwn ? 'right-0' : 'left-0'
          }`}
        >
          <div className="relative">
            <button
              onClick={() => setShowReactionsBar(!showReactionsBar)}
              className="p-1 hover:text-amber-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="React"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {/* Quick Reactions Tooltip */}
            {showReactionsBar && (
              <div className="absolute bottom-7 left-0 flex items-center space-x-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(message, emoji);
                      setShowReactionsBar(false);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onReply(message)}
            className="p-1 hover:text-primary-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onForward(message)}
            className="p-1 hover:text-primary-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Forward"
          >
            <Forward className="w-3.5 h-3.5" />
          </button>

          {isOwn && (
            <button
              onClick={() => onEdit(message)}
              className="p-1 hover:text-sky-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {isOwn && (
            <button
              onClick={() => onDelete(message)}
              className="p-1 hover:text-rose-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Message Bubble Body */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words relative transition-all ${
            isOwn
              ? 'bg-primary-600 text-white rounded-br-sm'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-sm'
          }`}
        >
          {/* Forwarded label */}
          {message.isForwarded && (
            <div className="flex items-center space-x-1 text-[11px] opacity-75 mb-1 italic">
              <Forward className="w-3 h-3" />
              <span>Forwarded</span>
            </div>
          )}

          {/* Reply Quote Banner */}
          {message.replyTo && (
            <div
              className={`p-2 rounded-lg mb-2 text-xs border-l-4 ${
                isOwn
                  ? 'bg-primary-700/60 border-white/60 text-white/90'
                  : 'bg-slate-100 dark:bg-slate-900 border-primary-500 text-slate-700 dark:text-slate-300'
              }`}
            >
              <p className="font-semibold text-[11px] mb-0.5">
                {message.replyTo.sender?.firstName} {message.replyTo.sender?.lastName}
              </p>
              <p className="truncate opacity-80">{message.replyTo.content || '[Media]'}</p>
            </div>
          )}

          {/* Attachments rendering */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2 mb-2">
              {message.attachments.map((att) => {
                const isImage = att.fileType.startsWith('image/');
                if (isImage) {
                  return (
                    <div
                      key={att.id}
                      onClick={() => onImageClick(att.fileUrl, att.fileName)}
                      className="cursor-pointer overflow-hidden rounded-xl group/img relative"
                    >
                      <img
                        src={att.fileUrl}
                        alt={att.fileName}
                        className="max-h-64 w-full object-cover rounded-xl transition duration-200 group-hover/img:scale-105"
                      />
                    </div>
                  );
                }

                return (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    download={att.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center space-x-3 p-2.5 rounded-xl border transition ${
                      isOwn
                        ? 'bg-primary-700/50 border-white/20 text-white hover:bg-primary-700'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{att.fileName}</p>
                      <p className="text-[10px] opacity-70">{formatFileSize(att.fileSize)}</p>
                    </div>
                    <Download className="w-4 h-4 opacity-70" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Message Text Content */}
          {message.content && (
            <p className="whitespace-pre-wrap leading-relaxed select-text">{message.content}</p>
          )}

          {/* Timestamp, Edited badge & Read Status checkmarks */}
          <div
            className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${
              isOwn ? 'text-white/70' : 'text-slate-400'
            }`}
          >
            {message.isEdited && <span>edited</span>}
            <span>{formatTime(message.createdAt)}</span>

            {isOwn && (
              <span className="inline-flex items-center ml-0.5">
                {receiptStatus === 'READ' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-300 dark:text-sky-400" />
                ) : receiptStatus === 'DELIVERED' ? (
                  <CheckCheck className="w-3.5 h-3.5 opacity-80" />
                ) : (
                  <Check className="w-3.5 h-3.5 opacity-80" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction badges pill below message bubble */}
        {Object.keys(reactionCounts).length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-1 ${
              isOwn ? 'justify-end mr-1' : 'justify-start ml-1'
            }`}
          >
            {Object.entries(reactionCounts).map(([emoji, { count, userReacted }]) => (
              <button
                key={emoji}
                onClick={() => onReact(message, emoji)}
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs border shadow-xs transition ${
                  userReacted
                    ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-400 text-primary-600 dark:text-primary-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{emoji}</span>
                <span className="font-semibold text-[10px]">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
