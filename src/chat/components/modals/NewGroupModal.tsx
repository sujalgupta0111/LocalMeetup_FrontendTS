import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { contactsApi } from '../../api/contacts';
import { conversationsApi } from '../../api/conversations';
import type { Contact } from '../../types';
import { Users, Check, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveConversationId, addOrUpdateConversation } from '../../store/slices/chatSlice';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSelectedUserIds([]);
      setError('');
      setLoading(true);
      contactsApi
        .getContacts()
        .then((data) => setContacts(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const toggleMember = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    if (selectedUserIds.length === 0) {
      setError('Please select at least 1 member for the group');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const conv = await conversationsApi.createGroup({
        name: name.trim(),
        description: description.trim(),
        memberIds: selectedUserIds,
      });
      dispatch(addOrUpdateConversation(conv));
      dispatch(setActiveConversationId(conv.id));
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group">
      <form onSubmit={handleCreateGroup} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-sm border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Group Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Project ChatSphere, Developers Hangout"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Group Description (Optional)
          </label>
          <textarea
            placeholder="What is this group about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Members ({selectedUserIds.length} selected)
          </label>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1 bg-slate-50/50 dark:bg-slate-800/40">
            {loading ? (
              <div className="flex items-center justify-center p-6 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-primary-500 mr-2" />
                Loading contacts...
              </div>
            ) : contacts.length > 0 ? (
              contacts.map(({ contact }) => {
                const isSelected = selectedUserIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => toggleMember(contact.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Avatar
                        src={contact.avatarUrl}
                        name={`${contact.firstName} ${contact.lastName}`}
                        size="sm"
                        isOnline={contact.isOnline}
                        showStatus
                      />
                      <div className="truncate">
                        <p className="text-sm font-medium leading-none">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">@{contact.username}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-6 text-xs text-slate-400">
                No contacts found. Add some contacts first!
              </p>
            )}
          </div>
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
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            <span>Create Group</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
