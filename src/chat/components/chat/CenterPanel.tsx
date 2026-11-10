import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import {
  setMessages,
  addMessage,
  setReplyingTo,
  toggleRightPanel,
  setActiveConversationId,
} from '../../store/slices/chatSlice';
import { messagesApi } from '../../api/messages';
import { uploadsApi } from '../../api/uploads';
import { MessageItem } from './MessageItem';
import { EmojiPicker } from './EmojiPicker';
import { ImageLightboxModal } from '../modals/ImageLightboxModal';
import { ForwardModal } from '../modals/ForwardModal';
import { Avatar } from '../common/Avatar';
import { formatDateDivider, formatLastSeen } from '../../utils/format';
import type { Message } from '../../types';
import {
  Send,
  Paperclip,
  Smile,
  X,
  Search,
  Info,
  ArrowLeft,
  ChevronDown,
  Loader2,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface CenterPanelProps {
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  sendReceipt: (messageId: string, conversationId: string, status: 'DELIVERED' | 'READ') => void;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({ sendTyping, sendReceipt }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const activeConversationId = useSelector((state: RootState) => state.chat.activeConversationId);
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const activeMessages = useSelector(
    (state: RootState) => (activeConversationId ? state.chat.messages[activeConversationId] : []) || []
  );
  const typingUsersInConv = useSelector((state: RootState) =>
    activeConversationId ? state.chat.typingUsers[activeConversationId] || {} : {}
  );
  const replyingTo = useSelector((state: RootState) => state.chat.replyingTo);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<
    Array<{ fileUrl: string; fileName: string; fileType: string; fileSize: number }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Search inside chat
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // Modals state
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversation messages
  useEffect(() => {
    if (!activeConversationId) return;

    setLoadingMessages(true);
    messagesApi
      .getMessages(activeConversationId, 1, 100)
      .then((data) => {
        dispatch(setMessages({ conversationId: activeConversationId, messages: data.items }));
        // Mark as read in backend
        messagesApi.markRead(activeConversationId).catch(console.error);
      })
      .catch(console.error)
      .finally(() => {
        setLoadingMessages(false);
        scrollToBottom();
      });
  }, [activeConversationId, dispatch]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom();
    }
  }, [activeMessages.length, showScrollBottom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  // Handle typing indicator dispatch
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (!activeConversationId) return;

    sendTyping(activeConversationId, true);

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      sendTyping(activeConversationId, false);
    }, 2500);
  };

  // File upload selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadsApi.uploadFile(file);
        setAttachments((prev) => [...prev, res]);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to upload attachment');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!activeConversationId) return;
    if (!inputText.trim() && attachments.length === 0) return;

    if (editingMessage) {
      // Edit mode
      try {
        await messagesApi.editMessage(editingMessage.id, inputText.trim());
        setEditingMessage(null);
        setInputText('');
      } catch (err) {
        console.error(err);
      }
      return;
    }

    const payload = {
      conversationId: activeConversationId,
      content: inputText.trim(),
      replyToId: replyingTo?.id,
      attachments: attachments.map((a) => ({
        fileUrl: a.fileUrl,
        fileName: a.fileName,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
    };

    // Clear input immediately for optimal UX
    setInputText('');
    setAttachments([]);
    dispatch(setReplyingTo(null));

    // Clear typing indicator
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    sendTyping(activeConversationId, false);

    try {
      const newMsg = await messagesApi.sendMessage(payload);
      dispatch(addMessage(newMsg));
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reactions & message actions
  const handleReact = async (message: Message, emoji: string) => {
    try {
      await messagesApi.reactToMessage(message.id, emoji);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (message: Message) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messagesApi.deleteMessage(message.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setInputText(message.content);
  };

  // Search inside chat
  const handleChatSearch = async (q: string) => {
    setChatSearchQuery(q);
    if (!activeConversationId || !q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await messagesApi.searchMessages(activeConversationId, q.trim());
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-5 shadow-inner">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          ChatSphere
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          Send real-time messages, share files, react with emojis, and stay connected with your team and friends.
        </p>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>End-to-End WebSocket Real-Time Sync</span>
        </div>
      </div>
    );
  }

  // Active typing text
  const typingList = Object.values(typingUsersInConv).filter(
    (u) => u.username !== currentUser?.username
  );

  // Online status for header
  const isDirect = activeConv.type === 'DIRECT';
  const otherUser = activeConv.otherUser;
  const isOtherOnline = otherUser ? onlineUsers[otherUser.id] ?? otherUser.isOnline : false;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Top Header */}
      <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Back button on mobile */}
          <button
            onClick={() => dispatch(setActiveConversationId(null))}
            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Avatar
            src={activeConv.avatarUrl}
            name={activeConv.name || 'Chat'}
            isOnline={isDirect ? isOtherOnline : false}
            showStatus={isDirect}
            size="md"
          />

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {activeConv.name || 'Chat'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {typingList.length > 0 ? (
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  {typingList.map((t) => t.username).join(', ')} is typing...
                </span>
              ) : isDirect ? (
                formatLastSeen(isOtherOnline, otherUser?.lastSeen)
              ) : (
                `${activeConv.members?.length || 0} members`
              )}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setShowChatSearch(!showChatSearch)}
            className={`p-2 rounded-xl transition ${
              showChatSearch
                ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Search inside conversation"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch(toggleRightPanel())}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Conversation Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Search in Chat */}
      {showChatSearch && (
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={chatSearchQuery}
              onChange={(e) => handleChatSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
              autoFocus
            />
            {chatSearchQuery && (
              <button
                onClick={() => handleChatSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
              {searchResults.map((m) => (
                <div
                  key={m.id}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between"
                >
                  <span className="truncate">{m.content}</span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500 mr-2" />
            Loading messages...
          </div>
        ) : activeMessages.length > 0 ? (
          activeMessages.map((msg, index) => {
            const isOwn = msg.senderId === currentUser?.id;
            const prevMsg = activeMessages[index - 1];
            const showDateDivider =
              !prevMsg ||
              formatDateDivider(prevMsg.createdAt) !== formatDateDivider(msg.createdAt);

            return (
              <React.Fragment key={msg.id}>
                {showDateDivider && (
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 shadow-xs border border-slate-200/60 dark:border-slate-800/60">
                      {formatDateDivider(msg.createdAt)}
                    </span>
                  </div>
                )}
                <MessageItem
                  message={msg}
                  isOwn={isOwn}
                  onReply={(m) => dispatch(setReplyingTo(m))}
                  onForward={(m) => setForwardMessage(m)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReact={handleReact}
                  onImageClick={(url, name) => setLightboxImage({ url, name })}
                />
              </React.Fragment>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 text-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-2">
              <Smile className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">No messages yet</p>
            <p className="text-xs text-slate-400">Say hello and start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:scale-110 transition z-20"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Reply Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center space-x-2 border-l-4 border-primary-500 pl-2 min-w-0">
            <div>
              <p className="font-semibold text-primary-600 dark:text-primary-400">
                Replying to {replyingTo.sender?.firstName} {replyingTo.sender?.lastName}
              </p>
              <p className="text-slate-500 dark:text-slate-400 truncate">
                {replyingTo.content || '[Media]'}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setReplyingTo(null))}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs">
          <span className="font-medium text-amber-700 dark:text-amber-300">
            Editing message...
          </span>
          <button
            onClick={() => {
              setEditingMessage(null);
              setInputText('');
            }}
            className="p-1 rounded-full text-amber-600 hover:text-amber-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment Preview Chips */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto">
          {attachments.map((att, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-xs"
            >
              <FileText className="w-4 h-4 text-primary-500" />
              <span className="max-w-[120px] truncate">{att.fileName}</span>
              <button
                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                className="text-slate-400 hover:text-rose-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Composer Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-end space-x-2 relative z-20">
        {/* Emoji Popover */}
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={(emoji) => setInputText((prev) => prev + emoji)}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2.5 rounded-xl transition ${
            showEmojiPicker
              ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/40'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Insert Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Attach file or photo"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>

        {/* Text Input */}
        <div className="flex-1 min-w-0">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Press Enter to send)"
            rows={1}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm resize-none max-h-32"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() && attachments.length === 0}
          className="p-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white shadow-md transition disabled:opacity-40 disabled:hover:bg-primary-600"
          title="Send Message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage?.url}
        imageName={lightboxImage?.name}
      />

      {/* Forward Modal */}
      <ForwardModal
        isOpen={!!forwardMessage}
        onClose={() => setForwardMessage(null)}
        message={forwardMessage}
        conversations={conversations}
      />
    </div>
  );
};
