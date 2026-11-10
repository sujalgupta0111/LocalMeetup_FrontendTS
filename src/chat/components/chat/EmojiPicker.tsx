import React, { useState } from 'react';

const EMOJI_CATEGORIES: Record<string, string[]> = {
  Recent: ['👍', '❤️', '🔥', '😂', '🎉', '🚀', '😍', '🙏', '👏', '✨', '💯', '😊'],
  Smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😎'],
  Gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤙', '👈', '👉', '👆', '👇', '✋', '👋', '👏', '🙌', '🤝', '🙏'],
  Hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  Fun: ['🔥', '✨', '🎉', '🎊', '🚀', '⭐', '🌟', '💥', '🎈', '🎁', '🏆', '💯', '⚡', '☕', '🍕', '🍻', '🥳', '👻'],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('Recent');
  const [search, setSearch] = useState('');

  const emojisToDisplay = search.trim()
    ? Object.values(EMOJI_CATEGORIES).flat()
    : EMOJI_CATEGORIES[activeCategory] || [];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 left-2 z-30 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 animate-in zoom-in-95 duration-150"
    >
      <input
        type="text"
        placeholder="Search emoji..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-1.5 mb-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />

      {/* Category selector */}
      {!search.trim() && (
        <div className="flex border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2 overflow-x-auto text-xs">
          {Object.keys(EMOJI_CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                activeCategory === cat
                  ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto pr-1">
        {emojisToDisplay.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-125 transition-all"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
