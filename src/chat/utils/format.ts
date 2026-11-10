export const formatTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateDivider = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
};

export const formatLastSeen = (isOnline: boolean, lastSeenStr?: string): string => {
  if (isOnline) return 'Online';
  if (!lastSeenStr) return 'Offline';

  const d = new Date(lastSeenStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Last seen just now';
  if (diffSec < 3600) return `Last seen ${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `Last seen ${Math.floor(diffSec / 3600)}h ago`;
  return `Last seen ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
