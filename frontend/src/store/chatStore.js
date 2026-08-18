import { create } from 'zustand';
import { chatService } from '@/services/chatService';
const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const useChatStore = create((set, get) => ({
    messages: [],
    sessionId: SESSION_ID,
    isLoading: false,
    user: null,
    pendingAction: null,
    setUser: (user) => set({ user }),
    sendMessage: async (content) => {
        const { sessionId } = get();
        const userMsg = {
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
            const bobbyMsg = {
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
        }
        catch (err) {
            const errorMsg = {
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
    approveAction: async (approved, editedData) => {
        const { sessionId, pendingAction } = get();
        set({ isLoading: true });
        const systemMsg = {
            id: `msg-${Date.now()}-system`,
            sender: 'system',
            content: approved ? '✅ Ticket submitted for creation' : '✕ Ticket creation cancelled',
            timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, systemMsg] }));
        try {
            // If the user edited ticket data, send it as a message so the backend creates it freshly
            // Otherwise, use the standard approval endpoint
            if (approved && editedData && pendingAction?.type === 'create_ticket') {
                const editedSubject = editedData.subject || 'IT Support Request';
                const editedDesc = editedData.description || '';
                const editedPriority = editedData.priority || 'medium';
                const editedCategory = editedData.category || 'IT';
                // Send the approval with the approved flag
                const response = await chatService.approveAction({
                    session_id: sessionId,
                    approved: true,
                });
                const bobbyMsg = {
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
            }
            else {
                const response = await chatService.approveAction({
                    session_id: sessionId,
                    approved,
                });
                const bobbyMsg = {
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
            }
        }
        catch {
            const errorMsg = {
                id: `msg-${Date.now()}-error`,
                sender: 'bobby',
                content: 'Sorry, there was an issue processing that action. Please try again.',
                timestamp: new Date(),
            };
            set((s) => ({
                messages: [...s.messages, errorMsg],
                isLoading: false,
                pendingAction: null,
            }));
        }
    },
    clearChat: () => set({
        messages: [],
        pendingAction: null,
        sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }),
}));
