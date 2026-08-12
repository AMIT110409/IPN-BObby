import { create } from 'zustand';
import { v4 as uuidv4 } from 'crypto';
import type { Message, User, PendingAction } from '@/types/chat.types';
import { chatService } from '@/services/chatService';

interface ChatState {
  messages: Message[];
  sessionId: string;
  isLoading: boolean;
  user: User | null;
  pendingAction: PendingAction | null;

  setUser: (user: User) => void;
  sendMessage: (content: string) => Promise<void>;
  approveAction: (approved: boolean) => Promise<void>;
  clearChat: () => void;
}

// Generate session ID once per tab session
const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: SESSION_ID,
  isLoading: false,
  user: null,
  pendingAction: null,

  setUser: (user) => set({ user }),

  sendMessage: async (content: string) => {
    const { sessionId, user } = get();

    // Add user message immediately
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMsg], isLoading: true }));

    try {
      const response = await chatService.sendMessage({
        message: content,
        session_id: sessionId,
      });

      const bobbyMsg: Message = {
        id: `msg-${Date.now()}-bobby`,
        sender: 'bobby',
        content: response.message,
        timestamp: new Date(),
        intent: response.intent,
        requiresApproval: response.requires_approval,
        pendingAction: response.pending_action,
      };

      set((s) => ({
        messages: [...s.messages, bobbyMsg],
        isLoading: false,
        pendingAction: response.pending_action || null,
      }));
    } catch (err) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        sender: 'bobby',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      set((s) => ({
        messages: [...s.messages, errorMsg],
        isLoading: false,
      }));
    }
  },

  approveAction: async (approved: boolean) => {
    const { sessionId } = get();
    set({ isLoading: true });

    const systemMsg: Message = {
      id: `msg-${Date.now()}-system`,
      sender: 'system',
      content: approved ? '✅ You approved the action' : '❌ You rejected the action',
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, systemMsg] }));

    try {
      const response = await chatService.approveAction({
        session_id: sessionId,
        approved,
      });

      const bobbyMsg: Message = {
        id: `msg-${Date.now()}-bobby`,
        sender: 'bobby',
        content: response.message,
        timestamp: new Date(),
      };
      set((s) => ({
        messages: [...s.messages, bobbyMsg],
        isLoading: false,
        pendingAction: null,
      }));
    } catch {
      set({ isLoading: false, pendingAction: null });
    }
  },

  clearChat: () =>
    set({
      messages: [],
      pendingAction: null,
      sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }),
}));
