import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  addMessage,
  updateMessage,
  deleteMessageFromStore,
  addReactionToStore,
  removeReactionFromStore,
  updateReceiptInStore,
  setTypingIndicator,
  setUserStatus,
  addOrUpdateConversation,
} from '../store/slices/chatSlice';
import  type{ WSEvent } from '../types';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const activeConversationId = useSelector(
    (state: RootState) => state.chat.activeConversationId
  );

  const activeConvIdRef = useRef(activeConversationId);
  activeConvIdRef.current = activeConversationId;

  const wsRef = useRef<WebSocket | null>(null);
const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken) return;

    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use host with port 8080 or proxy port
    const host = window.location.port === '5173' ? 'localhost:8080' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws?token=${encodeURIComponent(accessToken)}`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        retryCountRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const lines = event.data.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            const data: WSEvent = JSON.parse(line);

            switch (data.type) {
              case 'chat_message': {
                dispatch(addMessage(data.payload));
                // If message is in currently open active conversation, acknowledge as READ
                if (
                  activeConvIdRef.current &&
                  (data.payload.conversationId === activeConvIdRef.current || data.payload.conversationID === activeConvIdRef.current) &&
                  data.payload.senderId !== user?.id
                ) {
                  sendReceipt(
                    data.payload.id,
                    data.payload.conversationId || data.payload.conversationID,
                    'READ'
                  );
                }
                break;
              }

              case 'message_update':
                dispatch(updateMessage(data.payload));
                break;

              case 'message_delete':
                dispatch(
                  deleteMessageFromStore({
                    conversationId: data.payload.conversationId,
                    messageId: data.payload.messageId,
                  })
                );
                break;

              case 'reaction_add':
                dispatch(addReactionToStore(data.payload));
                break;

              case 'reaction_remove':
                dispatch(removeReactionFromStore(data.payload));
                break;

              case 'message_receipt':
                dispatch(
                  updateReceiptInStore({
                    messageId: data.payload.messageId,
                    conversationId: data.payload.conversationId,
                    userId: data.payload.userId,
                    status: data.payload.status,
                  })
                );
                break;

              case 'typing':
                dispatch(
                  setTypingIndicator({
                    conversationId: data.payload.conversationId,
                    userId: data.payload.userId,
                    username: data.payload.username,
                    isTyping: true,
                  })
                );
                break;

              case 'stop_typing':
                dispatch(
                  setTypingIndicator({
                    conversationId: data.payload.conversationId,
                    userId: data.payload.userId,
                    username: data.payload.username,
                    isTyping: false,
                  })
                );
                break;

              case 'user_status':
                dispatch(
                  setUserStatus({
                    userId: data.payload.userId,
                    isOnline: data.payload.isOnline,
                  })
                );
                break;

              case 'group_update':
                if (data.payload && data.payload.id) {
                  dispatch(addOrUpdateConversation(data.payload));
                }
                break;
            }
          }
        } catch (e) {
          console.error('[WS] Failed to parse message:', e);
        }
      };

      socket.onclose = () => {
        wsRef.current = null;
        if (isAuthenticated) {
          const timeout = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          retryCountRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, timeout);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch (err) {
      console.error('[WS] Connection error:', err);
    }
  }, [isAuthenticated, accessToken, dispatch, user?.id]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendEvent = useCallback((event: WSEvent) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    }
  }, []);

  const sendTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      sendEvent({
        type: isTyping ? 'typing' : 'stop_typing',
        conversationId,
        payload: { conversationId, isTyping },
      });
    },
    [sendEvent]
  );

  const sendReceipt = useCallback(
    (messageId: string, conversationId: string, status: 'DELIVERED' | 'READ') => {
      sendEvent({
        type: 'message_receipt',
        conversationId,
        payload: {
          messageId,
          conversationId,
          status,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [sendEvent]
  );

  return { sendEvent, sendTyping, sendReceipt };
};
