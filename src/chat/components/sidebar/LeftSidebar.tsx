import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import {
  setActiveConversationId,
  setConversations,
  setActiveTab,
  addOrUpdateConversation,
} from '../../store/slices/chatSlice';
import { logout } from '../../store/slices/authSlice';
import { conversationsApi } from '../../api/conversations';
import { contactsApi } from '../../api/contacts';
import { authApi } from '../../api/auth';
import { Avatar } from '../common/Avatar';
import { formatTime } from '../../utils/format';
import type { Contact } from '../../types';
import { NewChatModal } from '../modals/NewChatModal';
import { NewGroupModal } from '../modals/NewGroupModal';
import { ProfileModal } from '../modals/ProfileModal';
import { ContactRequestsModal } from '../modals/ContactRequestsModal';
import {
  MessageSquare,
  Users,
  UserPlus,
  Plus,
  Search,
  LogOut,
  Moon,
  Sun,
  Loader2,
  CheckCheck,
  Check,
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

  // Fetch initial conversations and contacts
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

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || false;
  });

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    const fullName = `${c.contact.firstName} ${c.contact.lastName}`.toLowerCase();
    return fullName.includes(q) || c.contact.username.toLowerCase().includes(q);
  });

  // Total unread count
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div
      className={`w-full md:w-80 lg:w-96 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none z-10 ${
        activeConversationId ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* Top Profile Header */}
      <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div
          onClick={() => setShowProfileModal(true)}
          className="flex items-center space-x-3 cursor-pointer group min-w-0"
        >
          <Avatar
            src={currentUser?.avatarUrl}
            name={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`}
            size="md"
            isOnline={true}
            showStatus
            className="group-hover:scale-105 transition"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <p className="text-xs text-slate-400 truncate">@{currentUser?.username}</p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 transition"
            title="New Chat / Find Users"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowNewGroupModal(true)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 transition"
            title="Create New Group"
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowRequestsModal(true)}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 transition"
            title="Contact Requests"
          >
            <UserPlus className="w-4 h-4" />
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'chats' ? 'Search chats...' : 'Search contacts...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Nav Switcher: Chats vs Contacts */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 text-xs font-semibold">
        <button
          onClick={() => dispatch(setActiveTab('chats'))}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-2 border-b-2 transition ${
            activeTab === 'chats'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chats</span>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-primary-600 text-white text-[10px]">
              {totalUnread}
            </span>
          )}
        </button>

        <button
          onClick={() => dispatch(setActiveTab('contacts'))}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-2 border-b-2 transition ${
            activeTab === 'contacts'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Contacts ({contacts.length})</span>
        </button>
      </div>

      {/* Content List Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-primary-500 mr-2" />
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

              // Typing status in conversation
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
                      ? 'bg-primary-50/70 dark:bg-primary-950/40 border-l-4 border-primary-600'
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
                            ? 'font-bold text-primary-900 dark:text-primary-100'
                            : 'font-semibold text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {conv.name || 'Chat'}
                      </h4>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center space-x-1">
                        {isSomeoneTyping ? (
                          <span className="text-primary-600 dark:text-primary-400 font-medium italic animate-pulse">
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
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2 shadow-xs">
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
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
              >
                Start New Chat
              </button>
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
            <button
              onClick={() => setShowNewChatModal(true)}
              className="mt-3 px-3 py-1.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
            >
              Discover & Add Friends
            </button>
          </div>
        )}
      </div>

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
