import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { usersApi } from '../../api/users';
import { uploadsApi } from '../../api/uploads';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { updateUser, toggleTheme } from '../../store/slices/authSlice';
import { Camera, Moon, Sun, Check, Loader2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user, theme } = useSelector((state: RootState) => state.auth);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadsApi.uploadFile(file);
      setAvatarUrl(res.fileUrl);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSavedSuccess(false);

    try {
      const updated = await usersApi.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        avatarUrl,
      });
      dispatch(updateUser(updated));
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile & Preferences">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar section */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative group">
            <Avatar
              src={avatarUrl}
              name={`${firstName} ${lastName}`}
              size="xl"
              className="ring-4 ring-primary-500/20"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              @{user?.username}
            </p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Bio / Status
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
            placeholder="Tell your contacts about yourself..."
          />
        </div>

        {/* Theme Preference */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Interface Theme
              </p>
              <p className="text-xs text-slate-400">
                Currently set to {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Buttons */}
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
            disabled={submitting || savedSuccess}
            className={`px-5 py-2 rounded-xl text-white text-sm font-medium flex items-center space-x-2 shadow-sm transition ${
              savedSuccess
                ? 'bg-emerald-600'
                : 'bg-primary-600 hover:bg-primary-700 disabled:opacity-50'
            }`}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-4 h-4" />
            ) : null}
            <span>{savedSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
