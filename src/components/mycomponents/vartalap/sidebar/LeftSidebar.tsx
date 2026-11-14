import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  setActiveConversationId,
  setConversations,
  setActiveTab,
  addOrUpdateConversation,
} from '@/chat/store/slices/chatSlice';
import { logout } from '@/chat/store/slices/authSlice';
import { conversationsApi } from '@/chat/api/conversations';
import { contactsApi } from '@/chat/api/contacts';
import { authApi } from '@/chat/api/auth';
import { Avatar } from '@/chat/components/common/Avatar';
import { formatTime } from '@/utils/format';
import type { Contact } from '@/chat/types';
import { NewChatModal } from '@/chat/components/modals/NewChatModal';
import { NewGroupModal } from '@/chat/components/modals/NewGroupModal';
import { ProfileModal } from '@/chat/components/modals/ProfileModal';
import { ContactRequestsModal } from '@/chat/components/modals/ContactRequestsModal';
import Input from '@/components/mycomponents/ui/Input';
import Button from '@/components/mycomponents/ui/Button';
import ChatFeature from './ChatFeature';
import {
  MessageSquare,
  Users,
  Search,
  Loader2,
  CheckCheck,
} from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const activeConversationId = useSelector(
    (state: RootState) => state.chat.activeConversationId
  );
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const typingUsers = useSelector((state: RootState) => state.chat.typingUsers);
  const activeTab = useSelector((state: RootState) => state.chat.activeTab);

  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      conversationsApi.getConversations(),
      contactsApi.getContacts(),
      contactsApi.getPendingRequests(),
    ])
      .then(([convs, conts, reqs]) => {
        dispatch(setConversations(convs));
        setContacts(conts);
        setPendingRequestsCount(reqs.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dispatch]);

  const handleLogout = async () => {
    if (window.confirm('Log out from ChatSphere?')) {
      try {
        const token = localStorage.getItem('chatsphere_refresh_token') || undefined;
        await authApi.logout(token);
      } catch (err) {
        console.error(err);
      } finally {
        dispatch(logout());
        window.location.href = '/login';
      }
    }
  };

  const handleSelectContact = async (contactId: string) => {
    try {
      const conv = await conversationsApi.createDirectConversation(contactId);
      dispatch(addOrUpdateConversation(conv));
      dispatch(setActiveConversationId(conv.id));
      dispatch(setActiveTab('chats'));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || false;
  });

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    const fullName = `${c.contact.firstName} ${c.contact.lastName}`.toLowerCase();
    return fullName.includes(q) || c.contact.username.toLowerCase().includes(q);
  });

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    // 👈 'relative overflow-hidden' ensures ChatFeature stays strictly inside this LeftSidebar scope
    <div
      className={`relative overflow-hidden w-full md:w-80 lg:w-96 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none z-10 ${
        activeConversationId ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* 1. Search Bar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Input
          icon={Search}
          placeholder={activeTab === 'chats' ? 'Search chats...' : 'Search contacts...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="py-2 text-xs"
        />
      </div>

      {/* 2. Switcher Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 text-xs font-semibold shrink-0">
        <button
          type="button"
          onClick={() => dispatch(setActiveTab('chats'))}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-2 border-b-2 transition ${
            activeTab === 'chats'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chats</span>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground text-[10px]">
              {totalUnread}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => dispatch(setActiveTab('contacts'))}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-2 border-b-2 transition ${
            activeTab === 'contacts'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Contacts ({contacts.length})</span>
        </button>
      </div>

      {/* 3. List Content (pb-18 taaki aakhri contact button ke neeche na dabe) */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 pb-18">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
            Loading conversations...
          </div>
        ) : activeTab === 'chats' ? (
          filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isDirect = conv.type === 'DIRECT';
              const isOtherOnline =
                isDirect && conv.otherUser
                  ? onlineUsers[conv.otherUser.id] ?? conv.otherUser.isOnline
                  : false;

              const isSomeoneTyping =
                typingUsers[conv.id] &&
                Object.values(typingUsers[conv.id]).some(
                  (t) => t.username !== currentUser?.username
                );

              const lastMsg = conv.lastMessage;
              const isSentByMe = lastMsg?.senderId === currentUser?.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => dispatch(setActiveConversationId(conv.id))}
                  className={`flex items-center space-x-3 p-3.5 cursor-pointer transition relative ${
                    isActive
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Avatar
                    src={conv.avatarUrl}
                    name={conv.name || 'Chat'}
                    size="md"
                    isOnline={isDirect ? isOtherOnline : false}
                    showStatus={isDirect}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4
                        className={`text-sm truncate ${
                          isActive
                            ? 'font-bold text-foreground'
                            : 'font-semibold text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {conv.name || 'Chat'}
                      </h4>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center space-x-1">
                        {isSomeoneTyping ? (
                          <span className="text-primary font-medium italic animate-pulse">
                            typing...
                          </span>
                        ) : lastMsg ? (
                          <>
                            {isSentByMe && (
                              <span className="inline-flex mr-1 text-slate-400">
                                <CheckCheck className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span className="truncate">
                              {lastMsg.content ||
                                (lastMsg.attachments?.length
                                  ? `[${lastMsg.attachments[0].fileName}]`
                                  : '')}
                            </span>
                          </>
                        ) : (
                          <span className="italic text-slate-400">No messages yet</span>
                        )}
                      </p>

                      {conv.unreadCount && conv.unreadCount > 0 ? (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 ml-2 shadow-xs">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 text-xs px-4">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p>No conversations found</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowNewChatModal(true)}
                className="mt-3"
              >
                Start New Chat
              </Button>
            </div>
          )
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map(({ contact }) => {
            const isOnline = onlineUsers[contact.id] ?? contact.isOnline;
            return (
              <div
                key={contact.id}
                onClick={() => handleSelectContact(contact.id)}
                className="flex items-center space-x-3 p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
              >
                <Avatar
                  src={contact.avatarUrl}
                  name={`${contact.firstName} ${contact.lastName}`}
                  size="md"
                  isOnline={isOnline}
                  showStatus
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {contact.firstName} {contact.lastName}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">@{contact.username}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 text-xs px-4">
            <Users className="w-8 h-8 mb-2 opacity-50" />
            <p>No contacts found</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNewChatModal(true)}
              className="mt-3"
            >
              Discover & Add Friends
            </Button>
          </div>
        )}
      </div>

      {/* 4. ChatFeature (Floating directly inside this LeftSidebar scope) */}
      <ChatFeature
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenNewChat={() => setShowNewChatModal(true)}
        onOpenNewGroup={() => setShowNewGroupModal(true)}
        onOpenRequests={() => setShowRequestsModal(true)}
        onLogout={handleLogout}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
      />
      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      <ContactRequestsModal
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        onRequestHandled={() => {
          contactsApi.getContacts().then((data) => setContacts(data));
          contactsApi.getPendingRequests().then((r) => setPendingRequestsCount(r.length));
        }}
      />
    </div>
  );
};

export default LeftSidebar;