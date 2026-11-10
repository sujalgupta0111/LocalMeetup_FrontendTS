import { createSlice,type  PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, Message, MessageReaction } from '../../types';

interface ChatState {
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages list
  typingUsers: Record<string, Record<string, { username: string; timestamp: number }>>; // convId -> { userId -> info }
  onlineUsers: Record<string, boolean>; // userId -> isOnline
  activeTab: 'chats' | 'contacts' | 'groups' | 'requests' | 'settings';
  isRightPanelOpen: boolean;
  replyingTo: Message | null;
  searchQuery: string;
}

const initialState: ChatState = {
  activeConversationId: null,
  conversations: [],
  messages: {},
  typingUsers: {},
  onlineUsers: {},
  activeTab: 'chats',
  isRightPanelOpen: false,
  replyingTo: null,
  searchQuery: '',
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversationId: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      state.replyingTo = null;
      if (action.payload) {
        // Clear unread count locally
        const conv = state.conversations.find((c) => c.id === action.payload);
        if (conv) {
          conv.unreadCount = 0;
        }
      }
    },

    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
      // Pre-seed online statuses for direct conversations
      action.payload.forEach((c) => {
        if (c.type === 'DIRECT' && c.otherUser) {
          state.onlineUsers[c.otherUser.id] = c.otherUser.isOnline;
        }
      });
    },

    addOrUpdateConversation: (state, action: PayloadAction<Conversation>) => {
      const idx = state.conversations.findIndex((c) => c.id === action.payload.id);
      if (idx >= 0) {
        state.conversations[idx] = { ...state.conversations[idx], ...action.payload };
      } else {
        state.conversations.unshift(action.payload);
      }
      // Re-sort by updated_at
      state.conversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },

    removeConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter((c) => c.id !== action.payload);
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = null;
      }
    },

    setMessages: (
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>
    ) => {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      const convId = msg.conversationId;

      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      // Check if message already exists
      const exists = state.messages[convId].some((m) => m.id === msg.id);
      if (!exists) {
        state.messages[convId].push(msg);
      }

      // Update lastMessage and updatedAt in conversation list
      const conv = state.conversations.find((c) => c.id === convId);
      if (conv) {
        conv.lastMessage = msg;
        conv.updatedAt = msg.createdAt;
        if (state.activeConversationId !== convId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        // Move conversation to top
        state.conversations = [
          conv,
          ...state.conversations.filter((c) => c.id !== convId),
        ];
      }
    },

    updateMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      const convId = msg.conversationId;
      if (state.messages[convId]) {
        const idx = state.messages[convId].findIndex((m) => m.id === msg.id);
        if (idx >= 0) {
          state.messages[convId][idx] = { ...state.messages[convId][idx], ...msg };
        }
      }
    },

    deleteMessageFromStore: (
      state,
      action: PayloadAction<{ conversationId: string; messageId: string }>
    ) => {
      const { conversationId, messageId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].filter(
          (m) => m.id !== messageId
        );
      }
    },

    addReactionToStore: (state, action: PayloadAction<MessageReaction>) => {
      const reaction = action.payload;
      // Find message across conversations
      for (const convId in state.messages) {
        const msg = state.messages[convId].find((m) => m.id === reaction.messageId);
        if (msg) {
          if (!msg.reactions) {
            msg.reactions = [];
          }
          const exists = msg.reactions.some(
            (r) => r.userId === reaction.userId && r.emoji === reaction.emoji
          );
          if (!exists) {
            msg.reactions.push(reaction);
          }
          break;
        }
      }
    },

    removeReactionFromStore: (
      state,
      action: PayloadAction<{ messageId: string; userId: string; emoji: string }>
    ) => {
      const { messageId, userId, emoji } = action.payload;
      for (const convId in state.messages) {
        const msg = state.messages[convId].find((m) => m.id === messageId);
        if (msg && msg.reactions) {
          msg.reactions = msg.reactions.filter(
            (r) => !(r.userId === userId && r.emoji === emoji)
          );
          break;
        }
      }
    },

    updateReceiptInStore: (
      state,
      action: PayloadAction<{
        messageId?: string;
        conversationId?: string;
        userId: string;
        status: 'SENT' | 'DELIVERED' | 'READ';
      }>
    ) => {
      const { messageId, conversationId, userId, status } = action.payload;
      if (conversationId && state.messages[conversationId]) {
        state.messages[conversationId].forEach((msg) => {
          if (!messageId || msg.id === messageId) {
            if (!msg.receipts) {
              msg.receipts = [];
            }
            const receipt = msg.receipts.find((r) => r.userId === userId);
            if (receipt) {
              receipt.status = status;
            } else {
              msg.receipts.push({
                id: `${msg.id}-${userId}`,
                messageId: msg.id,
                userId,
                status,
                timestamp: new Date().toISOString(),
              });
            }
          }
        });
      }
    },

    setTypingIndicator: (
      state,
      action: PayloadAction<{
        conversationId: string;
        userId: string;
        username: string;
        isTyping: boolean;
      }>
    ) => {
      const { conversationId, userId, username, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = {};
      }
      if (isTyping) {
        state.typingUsers[conversationId][userId] = {
          username,
          timestamp: Date.now(),
        };
      } else {
        delete state.typingUsers[conversationId][userId];
      }
    },

    setUserStatus: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean }>
    ) => {
      state.onlineUsers[action.payload.userId] = action.payload.isOnline;
      // Update in conversation.otherUser if applicable
      state.conversations.forEach((c) => {
        if (c.type === 'DIRECT' && c.otherUser && c.otherUser.id === action.payload.userId) {
          c.otherUser.isOnline = action.payload.isOnline;
        }
      });
    },

    setActiveTab: (
      state,
      action: PayloadAction<'chats' | 'contacts' | 'groups' | 'requests' | 'settings'>
    ) => {
      state.activeTab = action.payload;
    },

    toggleRightPanel: (state, action: PayloadAction<boolean | undefined>) => {
      state.isRightPanelOpen =
        action.payload !== undefined ? action.payload : !state.isRightPanelOpen;
    },

    setReplyingTo: (state, action: PayloadAction<Message | null>) => {
      state.replyingTo = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setActiveConversationId,
  setConversations,
  addOrUpdateConversation,
  removeConversation,
  setMessages,
  addMessage,
  updateMessage,
  deleteMessageFromStore,
  addReactionToStore,
  removeReactionFromStore,
  updateReceiptInStore,
  setTypingIndicator,
  setUserStatus,
  setActiveTab,
  toggleRightPanel,
  setReplyingTo,
  setSearchQuery,
} = chatSlice.actions;

export default chatSlice.reducer;
