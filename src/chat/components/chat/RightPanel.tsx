import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { toggleRightPanel, removeConversation } from '../../store/slices/chatSlice';
import { Avatar } from '../common/Avatar';
import { conversationsApi } from '../../api/conversations';
import { contactsApi } from '../../api/contacts';
import { messagesApi } from '../../api/messages';
import type { MessageAttachment, Contact } from '../../types';
import { formatFileSize, formatLastSeen } from '../../utils/format';
import {
  X,
  UserX,
  Trash2,
  LogOut,
  UserPlus,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

interface RightPanelProps {
  onImageClick?: (url: string, name: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onImageClick }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const activeConversationId = useSelector(
    (state: RootState) => state.chat.activeConversationId
  );
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const isRightPanelOpen = useSelector((state: RootState) => state.chat.isRightPanelOpen);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'files'>('info');
  const [sharedMedia, setSharedMedia] = useState<MessageAttachment[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Add Member state
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [selectedAddUserId, setSelectedAddUserId] = useState('');

  useEffect(() => {
    if (!activeConversationId) return;

    // Load shared media
    setLoadingMedia(true);
    messagesApi
      .getSharedMedia(activeConversationId)
      .then((data) => setSharedMedia(data))
      .catch(console.error)
      .finally(() => setLoadingMedia(false));
  }, [activeConversationId]);

  if (!isRightPanelOpen || !activeConv) return null;

  const isDirect = activeConv.type === 'DIRECT';
  const otherUser = activeConv.otherUser;
  const isOtherOnline = otherUser ? onlineUsers[otherUser.id] ?? otherUser.isOnline : false;

  const isAdmin = activeConv.members?.some(
    (m) => m.userId === currentUser?.id && m.role === 'ADMIN'
  );

  const handleBlockToggle = async () => {
    if (!otherUser) return;
    try {
      if (isBlocked) {
        await contactsApi.unblockUser(otherUser.id);
        setIsBlocked(false);
      } else {
        await contactsApi.blockUser(otherUser.id);
        setIsBlocked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm('Are you sure you want to delete this entire conversation?')) {
      try {
        await conversationsApi.deleteConversation(activeConv.id);
        dispatch(removeConversation(activeConv.id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await conversationsApi.removeGroupMember(activeConv.id, currentUser.id);
        dispatch(removeConversation(activeConv.id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenAddMember = async () => {
    setShowAddMember(true);
    try {
      const contacts = await contactsApi.getContacts();
      const existingMemberIds = new Set(activeConv.members?.map((m) => m.userId) || []);
      const nonMembers = contacts.filter((c) => !existingMemberIds.has(c.contactId));
      setAvailableContacts(nonMembers);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMemberSubmit = async () => {
    if (!selectedAddUserId) return;
    try {
      await conversationsApi.addGroupMember(activeConv.id, selectedAddUserId);
      setShowAddMember(false);
      setSelectedAddUserId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (window.confirm('Remove this member from group?')) {
      try {
        await conversationsApi.removeGroupMember(activeConv.id, userId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const imageAttachments = sharedMedia.filter((m) => m.fileType.startsWith('image/'));
  const documentAttachments = sharedMedia.filter((m) => !m.fileType.startsWith('image/'));

  return (
    <div className="w-80 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-lg animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {isDirect ? 'Contact Info' : 'Group Info'}
        </h3>
        <button
          onClick={() => dispatch(toggleRightPanel(false))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === 'info'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === 'media'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Media ({imageAttachments.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === 'files'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Files ({documentAttachments.length})
        </button>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'info' && (
          <>
            {/* Identity Card */}
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={activeConv.avatarUrl}
                name={activeConv.name || 'Chat'}
                size="xl"
                isOnline={isDirect ? isOtherOnline : false}
                showStatus={isDirect}
                className="mb-3"
              />
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {activeConv.name || 'Chat'}
              </h4>
              {isDirect && otherUser && (
                <p className="text-xs text-slate-400 mt-0.5">@{otherUser.username}</p>
              )}
              <p className="text-xs text-emerald-500 font-medium mt-1">
                {isDirect
                  ? formatLastSeen(isOtherOnline, otherUser?.lastSeen)
                  : `${activeConv.members?.length || 0} members`}
              </p>
            </div>

            {/* Bio or Description */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {isDirect ? 'About' : 'Group Description'}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {isDirect
                  ? otherUser?.bio || 'Hey there! I am using ChatSphere.'
                  : activeConv.description || 'No description provided.'}
              </p>
            </div>

            {/* Direct contact details */}
            {isDirect && otherUser && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{otherUser.email}</p>
                </div>
              </div>
            )}

            {/* Group Members List */}
            {!isDirect && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Members ({activeConv.members?.length || 0})
                  </span>
                  {isAdmin && (
                    <button
                      onClick={handleOpenAddMember}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center space-x-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>

                {/* Add Member inline form */}
                {showAddMember && (
                  <div className="p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900 space-y-2 animate-in fade-in">
                    <p className="text-xs font-semibold text-primary-900 dark:text-primary-200">
                      Add a Contact to Group:
                    </p>
                    <select
                      value={selectedAddUserId}
                      onChange={(e) => setSelectedAddUserId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="">Select a contact...</option>
                      {availableContacts.map(({ contact }) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.firstName} {contact.lastName} (@{contact.username})
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setShowAddMember(false)}
                        className="px-2.5 py-1 rounded text-xs text-slate-500 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMemberSubmit}
                        disabled={!selectedAddUserId}
                        className="px-3 py-1 rounded bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
                      >
                        Add Member
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeConv.members?.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Avatar
                          src={m.user?.avatarUrl}
                          name={`${m.user?.firstName} ${m.user?.lastName}`}
                          size="sm"
                          isOnline={onlineUsers[m.userId] ?? m.user?.isOnline}
                          showStatus
                        />
                        <div className="truncate">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                            {m.user?.firstName} {m.user?.lastName}
                            {m.userId === currentUser?.id && ' (You)'}
                          </p>
                          <p className="text-[10px] text-slate-400">@{m.user?.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {m.role === 'ADMIN' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                            Admin
                          </span>
                        )}

                        {isAdmin && m.userId !== currentUser?.id && (
                          <button
                            onClick={() => handleRemoveMember(m.userId)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Remove Member"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danger Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {isDirect ? (
                <>
                  <button
                    onClick={handleBlockToggle}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900 transition"
                  >
                    <UserX className="w-4 h-4" />
                    <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
                  </button>

                  <button
                    onClick={handleDeleteChat}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Chat</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLeaveGroup}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Leave Group</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={handleDeleteChat}
                      className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Group</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="space-y-3">
            {loadingMedia ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading media...
              </div>
            ) : imageAttachments.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {imageAttachments.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => onImageClick?.(img.fileUrl, img.fileName)}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 hover:scale-105 transition shadow-xs border border-slate-200 dark:border-slate-800"
                  >
                    <img
                      src={img.fileUrl}
                      alt={img.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No shared photos in this chat
              </div>
            )}
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="space-y-2">
            {loadingMedia ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading documents...
              </div>
            ) : documentAttachments.length > 0 ? (
              documentAttachments.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  download={doc.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs"
                >
                  <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {doc.fileName}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatFileSize(doc.fileSize)}</p>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No shared documents in this chat
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
