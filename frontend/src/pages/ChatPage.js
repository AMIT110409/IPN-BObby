import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ActionButtons from '@/components/chat/ActionButtons';
import styles from './ChatPage.module.css';
export default function ChatPage() {
    const { messages, isLoading, pendingAction, sendMessage, approveAction } = useChatStore();
    const bottomRef = useRef(null);
    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    return (_jsxs("div", { className: styles.container, children: [_jsxs("div", { className: styles.header, children: [_jsx("div", { className: styles.headerAvatar, children: "B" }), _jsxs("div", { children: [_jsx("h2", { className: styles.headerTitle, children: "Bobby" }), _jsxs("p", { className: styles.headerStatus, children: [_jsx("span", { className: styles.statusDot }), "AI Service Agent \u00B7 Online"] })] })] }), _jsxs("div", { className: styles.messages, children: [messages.length === 0 && (_jsxs("div", { className: styles.welcome, children: [_jsx("div", { className: styles.welcomeIcon, children: "\uD83D\uDC4B" }), _jsx("h3", { children: "Hi, I'm Bobby!" }), _jsx("p", { children: "I can help you with IT support, create tickets, check ticket status, unlock accounts, and more." }), _jsx("div", { className: styles.suggestions, children: [
                                    'How do I connect to the VPN?',
                                    'My account is locked',
                                    'Show my open tickets',
                                    'I need to reset my password',
                                ].map((s) => (_jsx("button", { className: styles.suggestion, onClick: () => sendMessage(s), children: s }, s))) })] })), messages.map((msg) => (_jsx(MessageBubble, { message: msg }, msg.id))), isLoading && _jsx(TypingIndicator, {}), pendingAction && !isLoading && (_jsx(ActionButtons, { onApprove: () => approveAction(true), onReject: () => approveAction(false) })), _jsx("div", { ref: bottomRef })] }), _jsx(ChatInput, { onSend: sendMessage, disabled: isLoading || !!pendingAction })] }));
}
