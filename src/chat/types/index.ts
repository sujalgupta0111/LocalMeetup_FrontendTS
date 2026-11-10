export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  contactId: string;
  contact: User;
  createdAt: string;
}

export interface ContactRequest {
  id: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface UserBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  blocked: User;
  createdAt: string;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  lastReadMessageId?: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  user?: User;
  emoji: string;
  createdAt: string;
}

export interface MessageReceipt {
  id: string;
  messageId: string;
  userId: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  timestamp: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  replyToId?: string;
  replyTo?: Message;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  isEdited: boolean;
  isForwarded: boolean;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  receipts?: MessageReceipt[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name?: string;
  description?: string;
  avatarUrl?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  members: ConversationMember[];
  lastMessage?: Message;
  unreadCount?: number;
  otherUser?: User; // In DIRECT chats
}

export interface Notification {
  id: string;
  userId: string;
  type: 'NEW_MESSAGE' | 'CONTACT_REQUEST' | 'GROUP_INVITE' | 'MENTION';
  title: string;
  body: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserSearchResult {
  user: User;
  isContact: boolean;
  isPendingSent: boolean;
  isPendingReceived: boolean;
  isBlocked: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface UserStatusPayload {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface ReceiptPayload {
  messageId: string;
  conversationId: string;
  userId: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  timestamp: string;
}

export interface WSEvent<T = any> {
  type:
    | 'chat_message'
    | 'message_update'
    | 'message_delete'
    | 'message_receipt'
    | 'reaction_add'
    | 'reaction_remove'
    | 'typing'
    | 'stop_typing'
    | 'user_status'
    | 'notification'
    | 'group_update'
    | 'contact_update'
    | 'error';
  conversationId?: string;
  userId?: string;
  payload: T;
}
